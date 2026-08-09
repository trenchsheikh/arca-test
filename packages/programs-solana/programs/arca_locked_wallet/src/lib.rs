use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer, transfer};

declare_id!("ArcaLocked11111111111111111111111111111111");

/// Arca Locked Wallet Program
/// 
/// Holds 20% of agent token supply at launch.
/// Permanently locked by default.
/// 
/// Release condition:
/// - Full operational capital raised during ICO must be **fully deployed**
/// - Attestation via oracle or admin-attested on-chain condition
/// - Otherwise remains permanently locked (reduces circulating supply)
/// 
/// See PRD §7.4 for acceptance tests.

#[program]
pub mod arca_locked_wallet {
    use super::*;

    /// Initialize a locked wallet for an agent token.
    pub fn initialize(
        ctx: Context<Initialize>,
        agent_mint: Pubkey,
        beneficiary: Pubkey,
    ) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        
        wallet.authority = ctx.accounts.authority.key();
        wallet.agent_mint = agent_mint;
        wallet.beneficiary = beneficiary;
        wallet.released = false;
        wallet.bump = ctx.bumps.wallet;
        
        msg!("Locked wallet initialized for mint: {}", agent_mint);
        
        Ok(())
    }

    /// Release tokens if authorized.
    /// 
    /// Authorization logic:
    /// - Platform admin must attest that full operational capital has been deployed
    /// - OR: Oracle-attested on-chain condition (TBD — see PRD risks)
    /// 
    /// TODO (production):
    /// - Define precise attestation mechanism before audit
    /// - Options: admin multisig attestation, oracle integration, or time-locked release
    /// - For now, requires authority signature (admin-only)
    pub fn release(ctx: Context<Release>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        
        require!(!wallet.released, LockedWalletError::AlreadyReleased);
        
        // TODO: Verify attestation condition
        // For MVP: admin signature is sufficient
        
        wallet.released = true;
        
        // Transfer tokens to beneficiary
        // TODO: Implement actual token transfer from locked vault to beneficiary
        
        msg!("Locked wallet released for mint: {}", wallet.agent_mint);
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + LockedWallet::INIT_SPACE,
        seeds = [b"locked-wallet", agent_mint.as_ref()],
        bump
    )]
    pub wallet: Account<'info, LockedWallet>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// Agent mint (passed as remaining account or via instruction data)
    /// CHECK: Stored as pubkey
    pub agent_mint: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Release<'info> {
    #[account(
        mut,
        seeds = [b"locked-wallet", wallet.agent_mint.as_ref()],
        bump = wallet.bump
    )]
    pub wallet: Account<'info, LockedWallet>,
    
    #[account(constraint = authority.key() == wallet.authority)]
    pub authority: Signer<'info>,
    
    // TODO: Add token accounts for release transfer
    // - from: locked vault token account
    // - to: beneficiary token account
}

#[account]
#[derive(InitSpace)]
pub struct LockedWallet {
    pub authority: Pubkey,
    pub agent_mint: Pubkey,
    pub beneficiary: Pubkey,
    pub released: bool,
    pub bump: u8,
}

#[error_code]
pub enum LockedWalletError {
    #[msg("Tokens have already been released")]
    AlreadyReleased,
    #[msg("Release condition not met")]
    ReleaseConditionNotMet,
}
