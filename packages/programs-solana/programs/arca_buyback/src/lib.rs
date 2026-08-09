use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer};

declare_id!("ArcaBuyback111111111111111111111111111111111");

/// The immutable 90/10 buyback split is the core invariant of the Arca platform.
/// 
/// This program:
/// - Receives periodic revenue from agent operations
/// - Executes 90% agent token buyback + 10% platform token buyback
/// - Emits verifiable on-chain events
/// - DOES NOT allow deployer to modify, pause, or redirect the split
/// 
/// The split is IMMUTABLE post-initialization.

#[program]
pub mod arca_buyback {
    use super::*;

    /// Initialize a buyback configuration for an agent.
    /// 
    /// The split (agent_bps=9000, platform_bps=1000) is fixed at initialization
    /// and CANNOT be changed by anyone, including the deployer.
    pub fn initialize(
        ctx: Context<Initialize>,
        agent_mint: Pubkey,
        platform_mint: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        
        config.authority = ctx.accounts.authority.key();
        config.keeper = ctx.accounts.keeper.key();
        config.agent_mint = agent_mint;
        config.platform_mint = platform_mint;
        
        // IMMUTABLE SPLIT: 90% agent, 10% platform
        config.agent_bps = 9000;
        config.platform_bps = 1000;
        
        config.bump = ctx.bumps.config;
        
        msg!("Buyback config initialized with IMMUTABLE 90/10 split");
        
        Ok(())
    }

    /// Execute a buyback.
    /// 
    /// Only the keeper (platform-controlled address) can call this.
    /// Deployer CANNOT call this or modify the split.
    /// 
    /// TODO (production):
    /// - Integrate Jupiter CPI for swaps on Solana
    /// - Calculate 90% and 10% splits from revenue_amount
    /// - Execute two market buys: agent token (90%) and platform token (10%)
    /// - Handle slippage and minimum output amounts
    /// - Return purchased token amounts in event
    /// 
    /// MVP: This stub transfers/accounts for the split and emits the event structure.
    pub fn execute_buyback(
        ctx: Context<ExecuteBuyback>,
        revenue_amount: u64,
    ) -> Result<()> {
        let config = &ctx.accounts.config;
        
        // Only keeper can execute
        require!(
            ctx.accounts.keeper.key() == config.keeper,
            BuybackError::UnauthorizedKeeper
        );
        
        // Calculate split (BPS = basis points, 10000 = 100%)
        let agent_amount = revenue_amount
            .checked_mul(config.agent_bps as u64)
            .unwrap()
            .checked_div(10000)
            .unwrap();
        
        let platform_amount = revenue_amount
            .checked_mul(config.platform_bps as u64)
            .unwrap()
            .checked_div(10000)
            .unwrap();
        
        msg!(
            "Executing buyback: {} SOL total, {} for agent token, {} for platform token",
            revenue_amount,
            agent_amount,
            platform_amount
        );
        
        // TODO: Call Jupiter aggregator CPI to swap:
        // - agent_amount → agent_mint (buy agent tokens)
        // - platform_amount → platform_mint (buy platform tokens)
        // 
        // For now, we emit the event with accounting structure.
        
        emit!(BuybackExecuted {
            agent_mint: config.agent_mint,
            platform_mint: config.platform_mint,
            revenue_spent: revenue_amount,
            agent_amount_spent: agent_amount,
            platform_amount_spent: platform_amount,
            agent_tokens_bought: 0, // TODO: return from swap
            platform_tokens_bought: 0, // TODO: return from swap
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + BuybackConfig::INIT_SPACE,
        seeds = [b"buyback-config"],
        bump
    )]
    pub config: Account<'info, BuybackConfig>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// Keeper is the platform-controlled address authorized to execute buybacks.
    /// CHECK: Stored as pubkey, validated in execute_buyback
    pub keeper: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteBuyback<'info> {
    #[account(
        seeds = [b"buyback-config"],
        bump = config.bump
    )]
    pub config: Account<'info, BuybackConfig>,
    
    /// Only the keeper can execute buybacks.
    pub keeper: Signer<'info>,
    
    // TODO: Add accounts for Jupiter swap CPI:
    // - revenue_vault (source of funds)
    // - jupiter_program
    // - swap accounts (varies by Jupiter route)
}

/// Buyback configuration with IMMUTABLE split.
#[account]
#[derive(InitSpace)]
pub struct BuybackConfig {
    pub authority: Pubkey,      // Platform authority (not deployer)
    pub keeper: Pubkey,          // Authorized executor
    pub agent_mint: Pubkey,      // Agent token mint
    pub platform_mint: Pubkey,   // Platform token mint (ARCA)
    
    /// IMMUTABLE: 9000 basis points = 90%
    pub agent_bps: u16,
    
    /// IMMUTABLE: 1000 basis points = 10%
    pub platform_bps: u16,
    
    pub bump: u8,
}

/// Emitted on every buyback execution.
/// Indexed by off-chain workers and surfaced in UI.
#[event]
pub struct BuybackExecuted {
    pub agent_mint: Pubkey,
    pub platform_mint: Pubkey,
    pub revenue_spent: u64,
    pub agent_amount_spent: u64,
    pub platform_amount_spent: u64,
    pub agent_tokens_bought: u64,   // TODO: populate from swap result
    pub platform_tokens_bought: u64, // TODO: populate from swap result
    pub timestamp: i64,
}

#[error_code]
pub enum BuybackError {
    #[msg("Only the platform keeper can execute buybacks")]
    UnauthorizedKeeper,
}
