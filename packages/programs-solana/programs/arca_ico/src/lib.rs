use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};

declare_id!("ArcaIco1111111111111111111111111111111111111");

/// Arca ICO program
/// 
/// Responsibilities:
/// - Accept SOL contributions during raise window
/// - Track contributions per wallet
/// - Enforce minimum ticket
/// - Enforce raise threshold (50-80% configurable at init)
/// - Refund if threshold not met
/// - Token distribution / claims on success
/// - Deployer vesting
/// 
/// Mirrors EVM contract invariants (§7.2 in PRD).

#[program]
pub mod arca_ico {
    use super::*;

    /// Initialize an ICO for an agent.
    pub fn initialize(
        ctx: Context<Initialize>,
        agent_id: String,
        launch_fdv: u64,
        raise_target: u64,
        threshold_bps: u16, // 5000 = 50%, up to 8000 = 80%
        min_ticket: u64,
        window_start: i64,
        window_end: i64,
    ) -> Result<()> {
        require!(
            threshold_bps >= 5000 && threshold_bps <= 8000,
            IcoError::InvalidThreshold
        );
        
        let ico = &mut ctx.accounts.ico;
        
        ico.agent_id = agent_id;
        ico.authority = ctx.accounts.authority.key();
        ico.launch_fdv = launch_fdv;
        ico.raise_target = raise_target;
        ico.threshold_bps = threshold_bps;
        ico.min_ticket = min_ticket;
        ico.window_start = window_start;
        ico.window_end = window_end;
        ico.total_raised = 0;
        ico.contributor_count = 0;
        ico.paused = false;
        ico.finalized = false;
        ico.bump = ctx.bumps.ico;
        
        msg!("ICO initialized for agent: {}", ico.agent_id);
        
        Ok(())
    }

    /// Contribute SOL to the ICO.
    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        let ico = &mut ctx.accounts.ico;
        let now = Clock::get()?.unix_timestamp;
        
        // Validate window
        require!(now >= ico.window_start, IcoError::NotStarted);
        require!(now < ico.window_end, IcoError::Ended);
        require!(!ico.paused, IcoError::Paused);
        require!(!ico.finalized, IcoError::AlreadyFinalized);
        
        // Enforce minimum ticket
        require!(amount >= ico.min_ticket, IcoError::BelowMinTicket);
        
        // Transfer SOL from contributor to ICO vault
        // TODO: Implement actual transfer logic (anchor native SOL transfer or via system_program)
        
        ico.total_raised = ico.total_raised.checked_add(amount).unwrap();
        ico.contributor_count = ico.contributor_count.checked_add(1).unwrap();
        
        emit!(Contribution {
            contributor: ctx.accounts.contributor.key(),
            amount,
            timestamp: now,
        });
        
        Ok(())
    }

    /// Refund a contributor (only if threshold not met or ICO cancelled).
    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        let ico = &ctx.accounts.ico;
        
        require!(ico.finalized, IcoError::NotFinalized);
        
        // Check if threshold was met
        let threshold_amount = ico.raise_target
            .checked_mul(ico.threshold_bps as u64)
            .unwrap()
            .checked_div(10000)
            .unwrap();
        
        require!(
            ico.total_raised < threshold_amount,
            IcoError::ThresholdMet
        );
        
        // TODO: Lookup contributor's contribution amount and transfer back
        
        emit!(Refund {
            contributor: ctx.accounts.contributor.key(),
            amount: 0, // TODO: actual amount
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Finalize the ICO (admin only).
    /// Checks threshold and sets finalized flag.
    pub fn finalize(ctx: Context<Finalize>) -> Result<()> {
        let ico = &mut ctx.accounts.ico;
        let now = Clock::get()?.unix_timestamp;
        
        require!(now >= ico.window_end, IcoError::NotEnded);
        require!(!ico.finalized, IcoError::AlreadyFinalized);
        
        let threshold_amount = ico.raise_target
            .checked_mul(ico.threshold_bps as u64)
            .unwrap()
            .checked_div(10000)
            .unwrap();
        
        let success = ico.total_raised >= threshold_amount;
        
        ico.finalized = true;
        
        emit!(RaiseFinalized {
            success,
            total_raised: ico.total_raised,
            timestamp: now,
        });
        
        Ok(())
    }

    /// Claim tokens (only if ICO succeeded).
    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let ico = &ctx.accounts.ico;
        
        require!(ico.finalized, IcoError::NotFinalized);
        
        let threshold_amount = ico.raise_target
            .checked_mul(ico.threshold_bps as u64)
            .unwrap()
            .checked_div(10000)
            .unwrap();
        
        require!(ico.total_raised >= threshold_amount, IcoError::ThresholdNotMet);
        
        // TODO: Calculate token allocation for contributor
        // TODO: Transfer tokens from ICO token account to contributor
        
        emit!(TokensClaimed {
            contributor: ctx.accounts.contributor.key(),
            amount: 0, // TODO: actual token amount
        });
        
        Ok(())
    }

    /// Pause ICO (admin only).
    pub fn pause(ctx: Context<AdminAction>) -> Result<()> {
        let ico = &mut ctx.accounts.ico;
        require!(!ico.finalized, IcoError::AlreadyFinalized);
        
        ico.paused = true;
        
        msg!("ICO paused by admin");
        
        Ok(())
    }

    /// Unpause ICO (admin only).
    pub fn unpause(ctx: Context<AdminAction>) -> Result<()> {
        let ico = &mut ctx.accounts.ico;
        ico.paused = false;
        
        msg!("ICO unpaused by admin");
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(agent_id: String)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Ico::INIT_SPACE,
        seeds = [b"ico", agent_id.as_bytes()],
        bump
    )]
    pub ico: Account<'info, Ico>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub ico: Account<'info, Ico>,
    
    #[account(mut)]
    pub contributor: Signer<'info>,
    
    // TODO: Add vault account to receive SOL
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub ico: Account<'info, Ico>,
    
    #[account(mut)]
    pub contributor: Signer<'info>,
    
    // TODO: Add vault account to send SOL from
}

#[derive(Accounts)]
pub struct Finalize<'info> {
    #[account(mut)]
    pub ico: Account<'info, Ico>,
    
    #[account(constraint = authority.key() == ico.authority)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub ico: Account<'info, Ico>,
    
    pub contributor: Signer<'info>,
    
    // TODO: Add token accounts for claim
}

#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(mut)]
    pub ico: Account<'info, Ico>,
    
    #[account(constraint = authority.key() == ico.authority)]
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Ico {
    #[max_len(50)]
    pub agent_id: String,
    pub authority: Pubkey,
    pub launch_fdv: u64,
    pub raise_target: u64,
    pub threshold_bps: u16,
    pub min_ticket: u64,
    pub window_start: i64,
    pub window_end: i64,
    pub total_raised: u64,
    pub contributor_count: u32,
    pub paused: bool,
    pub finalized: bool,
    pub bump: u8,
}

#[event]
pub struct Contribution {
    pub contributor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct Refund {
    pub contributor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct RaiseFinalized {
    pub success: bool,
    pub total_raised: u64,
    pub timestamp: i64,
}

#[event]
pub struct TokensClaimed {
    pub contributor: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum IcoError {
    #[msg("Invalid threshold (must be 50-80%)")]
    InvalidThreshold,
    #[msg("ICO has not started yet")]
    NotStarted,
    #[msg("ICO has ended")]
    Ended,
    #[msg("ICO is paused")]
    Paused,
    #[msg("ICO already finalized")]
    AlreadyFinalized,
    #[msg("Contribution below minimum ticket")]
    BelowMinTicket,
    #[msg("ICO not finalized yet")]
    NotFinalized,
    #[msg("Threshold was met, refund not available")]
    ThresholdMet,
    #[msg("Threshold not met, claims not available")]
    ThresholdNotMet,
    #[msg("ICO window has not ended yet")]
    NotEnded,
}
