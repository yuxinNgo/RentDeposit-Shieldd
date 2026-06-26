#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, Symbol};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum DepositCaseStatus {
    Created,
    Funded,
    MoveInConfirmed,
    RefundRequested,
    DeductionProposed,
    Disputed,
    Refunded,
    PartiallyRefunded,
    ReleasedToLandlord,
    Closed,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct DepositCase {
    pub initialized: bool,
    pub tenant: Address,
    pub landlord: Address,
    pub mediator: Address,
    pub asset_code: Symbol,
    pub amount: i128,
    pub status: DepositCaseStatus,
    pub funded_amount: i128,
    pub released: bool,
    pub deduction_amount: i128,
    pub deduction_reason_hash: Option<BytesN<32>>,
    pub dispute_reason_hash: Option<BytesN<32>>,
    pub resolution_hash: Option<BytesN<32>>,
    pub tenant_release_amount: i128,
    pub landlord_release_amount: i128,
}

#[derive(Clone)]
#[contracttype]
enum DataKey {
    Case,
}

#[contract]
pub struct RentDepositEscrow;

fn read_case(env: &Env) -> DepositCase {
    env.storage()
        .instance()
        .get(&DataKey::Case)
        .unwrap_or_else(|| panic!("case is not initialized"))
}

fn write_case(env: &Env, case_data: &DepositCase) {
    env.storage().instance().set(&DataKey::Case, case_data);
}

fn require_actor(actor: &Address, expected: &Address, label: &str) {
    actor.require_auth();
    if actor != expected {
        panic!("only {} can perform this action", label);
    }
}

fn assert_status(current: &DepositCaseStatus, expected: &[DepositCaseStatus]) {
    if expected.iter().all(|candidate| candidate != current) {
        panic!("invalid state transition");
    }
}

fn assert_open(case_data: &DepositCase) {
    if case_data.status == DepositCaseStatus::Closed {
        panic!("case already closed");
    }
}

fn assert_not_released(case_data: &DepositCase) {
    if case_data.released {
        panic!("funds already released");
    }
}

#[contractimpl]
impl RentDepositEscrow {
    pub fn initialize_case(
        env: Env,
        tenant: Address,
        landlord: Address,
        mediator: Address,
        asset_code: Symbol,
        amount: i128,
    ) {
        if env.storage().instance().has(&DataKey::Case) {
            panic!("case already initialized");
        }

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let case_data = DepositCase {
            initialized: true,
            tenant,
            landlord,
            mediator,
            asset_code,
            amount,
            status: DepositCaseStatus::Created,
            funded_amount: 0,
            released: false,
            deduction_amount: 0,
            deduction_reason_hash: None,
            dispute_reason_hash: None,
            resolution_hash: None,
            tenant_release_amount: 0,
            landlord_release_amount: 0,
        };

        write_case(&env, &case_data);
    }

    pub fn fund_deposit(env: Env, actor: Address, amount: i128) {
        let mut case_data = read_case(&env);
        assert_open(&case_data);
        assert_not_released(&case_data);
        require_actor(&actor, &case_data.tenant, "tenant");
        assert_status(&case_data.status, &[DepositCaseStatus::Created]);

        if amount != case_data.amount {
            panic!("fund amount must match the deposit amount");
        }

        case_data.funded_amount = amount;
        case_data.status = DepositCaseStatus::Funded;
        write_case(&env, &case_data);
    }

    pub fn confirm_move_in(env: Env, actor: Address) {
        let mut case_data = read_case(&env);
        assert_open(&case_data);
        assert_status(&case_data.status, &[DepositCaseStatus::Funded]);
        actor.require_auth();

        if actor != case_data.tenant && actor != case_data.landlord {
            panic!("only tenant or landlord can confirm move in");
        }

        case_data.status = DepositCaseStatus::MoveInConfirmed;
        write_case(&env, &case_data);
    }

    pub fn request_refund(env: Env, actor: Address) {
        let mut case_data = read_case(&env);
        assert_open(&case_data);
        assert_status(&case_data.status, &[DepositCaseStatus::MoveInConfirmed]);
        require_actor(&actor, &case_data.tenant, "tenant");

        case_data.status = DepositCaseStatus::RefundRequested;
        write_case(&env, &case_data);
    }

    pub fn approve_full_refund(env: Env, actor: Address) {
        let mut case_data = read_case(&env);
        assert_open(&case_data);
        assert_not_released(&case_data);
        assert_status(&case_data.status, &[DepositCaseStatus::RefundRequested]);
        require_actor(&actor, &case_data.landlord, "landlord");

        case_data.status = DepositCaseStatus::Refunded;
        case_data.released = true;
        case_data.tenant_release_amount = case_data.amount;
        case_data.landlord_release_amount = 0;
        write_case(&env, &case_data);
    }

    pub fn propose_deduction(env: Env, actor: Address, deduction_amount: i128, reason_hash: BytesN<32>) {
        let mut case_data = read_case(&env);
        assert_open(&case_data);
        assert_status(&case_data.status, &[DepositCaseStatus::RefundRequested]);
        require_actor(&actor, &case_data.landlord, "landlord");

        if deduction_amount < 0 || deduction_amount > case_data.amount {
            panic!("deduction cannot exceed deposit");
        }

        case_data.deduction_amount = deduction_amount;
        case_data.deduction_reason_hash = Some(reason_hash);
        case_data.status = DepositCaseStatus::DeductionProposed;
        write_case(&env, &case_data);
    }

    pub fn accept_deduction(env: Env, actor: Address) {
        let mut case_data = read_case(&env);
        assert_open(&case_data);
        assert_not_released(&case_data);
        assert_status(&case_data.status, &[DepositCaseStatus::DeductionProposed]);
        require_actor(&actor, &case_data.tenant, "tenant");

        case_data.status = if case_data.deduction_amount == case_data.amount {
            DepositCaseStatus::ReleasedToLandlord
        } else {
            DepositCaseStatus::PartiallyRefunded
        };
        case_data.released = true;
        case_data.landlord_release_amount = case_data.deduction_amount;
        case_data.tenant_release_amount = case_data.amount - case_data.deduction_amount;
        write_case(&env, &case_data);
    }

    pub fn open_dispute(env: Env, actor: Address, reason_hash: BytesN<32>) {
        let mut case_data = read_case(&env);
        assert_open(&case_data);
        assert_status(
            &case_data.status,
            &[DepositCaseStatus::RefundRequested, DepositCaseStatus::DeductionProposed],
        );
        actor.require_auth();

        if actor != case_data.tenant && actor != case_data.landlord {
            panic!("only tenant or landlord can open dispute");
        }

        case_data.dispute_reason_hash = Some(reason_hash);
        case_data.status = DepositCaseStatus::Disputed;
        write_case(&env, &case_data);
    }

    pub fn resolve_dispute(
        env: Env,
        actor: Address,
        tenant_amount: i128,
        landlord_amount: i128,
        resolution_hash: BytesN<32>,
    ) {
        let mut case_data = read_case(&env);
        assert_open(&case_data);
        assert_not_released(&case_data);
        assert_status(&case_data.status, &[DepositCaseStatus::Disputed]);
        require_actor(&actor, &case_data.mediator, "mediator");

        if tenant_amount < 0 || landlord_amount < 0 {
            panic!("resolution amounts must be non-negative");
        }

        if tenant_amount + landlord_amount > case_data.amount {
            panic!("resolution split cannot exceed deposit");
        }

        case_data.resolution_hash = Some(resolution_hash);
        case_data.tenant_release_amount = tenant_amount;
        case_data.landlord_release_amount = landlord_amount;
        case_data.released = true;
        case_data.status = DepositCaseStatus::Closed;
        write_case(&env, &case_data);
    }

    pub fn get_case(env: Env) -> DepositCase {
        read_case(&env)
    }

    pub fn close_case(env: Env, actor: Address) {
        let mut case_data = read_case(&env);
        assert_open(&case_data);
        actor.require_auth();

        if actor != case_data.landlord && actor != case_data.mediator {
            panic!("only landlord or mediator can close case");
        }

        assert_status(
            &case_data.status,
            &[
                DepositCaseStatus::Refunded,
                DepositCaseStatus::PartiallyRefunded,
                DepositCaseStatus::ReleasedToLandlord,
            ],
        );

        case_data.status = DepositCaseStatus::Closed;
        write_case(&env, &case_data);
    }
}

#[cfg(test)]
mod tests {
    extern crate std;

    use super::{DepositCaseStatus, RentDepositEscrow, RentDepositEscrowClient};
    use soroban_sdk::{testutils::Address as _, symbol_short, Address, BytesN, Env, Symbol};

    fn hash(env: &Env, seed: u8) -> BytesN<32> {
        BytesN::from_array(env, &[seed; 32])
    }

    fn setup() -> (Env, RentDepositEscrowClient<'static>, Address, Address, Address, Symbol) {
        let env = Env::default();
        let tenant = Address::generate(&env);
        let landlord = Address::generate(&env);
        let mediator = Address::generate(&env);
        let asset_code = symbol_short!("USDC");
        let contract_id = env.register(RentDepositEscrow, ());
        let client = RentDepositEscrowClient::new(&env, &contract_id);
        env.mock_all_auths();
        client.initialize_case(&tenant, &landlord, &mediator, &asset_code, &1_500);
        (env, client, tenant, landlord, mediator, asset_code)
    }

    #[test]
    fn initialize_success() {
        let (_env, client, tenant, landlord, mediator, asset_code) = setup();
        let case_data = client.get_case();
        assert_eq!(case_data.tenant, tenant);
        assert_eq!(case_data.landlord, landlord);
        assert_eq!(case_data.mediator, mediator);
        assert_eq!(case_data.asset_code, asset_code);
        assert_eq!(case_data.status, DepositCaseStatus::Created);
    }

    #[test]
    fn tenant_fund_success() {
        let (_env, client, tenant, _landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        assert_eq!(client.get_case().status, DepositCaseStatus::Funded);
    }

    #[test]
    #[should_panic(expected = "only tenant can perform this action")]
    fn non_tenant_fund_fail() {
        let (_env, client, _tenant, landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&landlord, &1_500);
    }

    #[test]
    #[should_panic(expected = "fund amount must match the deposit amount")]
    fn fund_wrong_amount_fail() {
        let (_env, client, tenant, _landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_200);
    }

    #[test]
    fn request_refund_success() {
        let (_env, client, tenant, _landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        assert_eq!(client.get_case().status, DepositCaseStatus::RefundRequested);
    }

    #[test]
    #[should_panic(expected = "only tenant can perform this action")]
    fn non_tenant_request_refund_fail() {
        let (_env, client, tenant, landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&landlord);
    }

    #[test]
    fn landlord_approve_refund_success() {
        let (_env, client, tenant, landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        client.approve_full_refund(&landlord);
        assert_eq!(client.get_case().status, DepositCaseStatus::Refunded);
    }

    #[test]
    #[should_panic(expected = "only landlord can perform this action")]
    fn non_landlord_approve_refund_fail() {
        let (_env, client, tenant, _landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        client.approve_full_refund(&tenant);
    }

    #[test]
    fn propose_deduction_success() {
        let (env, client, tenant, landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        client.propose_deduction(&landlord, &300, &hash(&env, 1));
        assert_eq!(client.get_case().status, DepositCaseStatus::DeductionProposed);
    }

    #[test]
    #[should_panic(expected = "deduction cannot exceed deposit")]
    fn deduction_greater_than_deposit_fail() {
        let (env, client, tenant, landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        client.propose_deduction(&landlord, &2_000, &hash(&env, 2));
    }

    #[test]
    fn tenant_accept_deduction_success() {
        let (env, client, tenant, landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        client.propose_deduction(&landlord, &300, &hash(&env, 3));
        client.accept_deduction(&tenant);
        assert_eq!(client.get_case().status, DepositCaseStatus::PartiallyRefunded);
    }

    #[test]
    fn open_dispute_success() {
        let (env, client, tenant, landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        client.propose_deduction(&landlord, &300, &hash(&env, 4));
        client.open_dispute(&tenant, &hash(&env, 5));
        assert_eq!(client.get_case().status, DepositCaseStatus::Disputed);
    }

    #[test]
    #[should_panic(expected = "only mediator can perform this action")]
    fn non_mediator_resolve_dispute_fail() {
        let (env, client, tenant, landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        client.propose_deduction(&landlord, &300, &hash(&env, 6));
        client.open_dispute(&tenant, &hash(&env, 7));
        client.resolve_dispute(&landlord, &1_100, &400, &hash(&env, 8));
    }

    #[test]
    fn mediator_resolve_split_success() {
        let (env, client, tenant, landlord, mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        client.propose_deduction(&landlord, &300, &hash(&env, 9));
        client.open_dispute(&tenant, &hash(&env, 10));
        client.resolve_dispute(&mediator, &1_200, &300, &hash(&env, 11));
        assert_eq!(client.get_case().status, DepositCaseStatus::Closed);
    }

    #[test]
    #[should_panic(expected = "resolution split cannot exceed deposit")]
    fn split_amount_greater_than_deposit_fail() {
        let (env, client, tenant, landlord, mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        client.propose_deduction(&landlord, &300, &hash(&env, 12));
        client.open_dispute(&tenant, &hash(&env, 13));
        client.resolve_dispute(&mediator, &1_300, &400, &hash(&env, 14));
    }

    #[test]
    #[should_panic(expected = "funds already released")]
    fn double_release_fail() {
        let (_env, client, tenant, landlord, _mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        client.approve_full_refund(&landlord);
        client.approve_full_refund(&landlord);
    }

    #[test]
    #[should_panic(expected = "case already closed")]
    fn action_after_closed_fail() {
        let (_env, client, tenant, landlord, mediator, _asset_code) = setup();
        client.fund_deposit(&tenant, &1_500);
        client.confirm_move_in(&tenant);
        client.request_refund(&tenant);
        client.approve_full_refund(&landlord);
        client.close_case(&mediator);
        client.request_refund(&tenant);
    }

    #[test]
    #[should_panic(expected = "invalid state transition")]
    fn invalid_state_transition_fail() {
        let (_env, client, tenant, _landlord, _mediator, _asset_code) = setup();
        client.request_refund(&tenant);
    }
}
