use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("YourProgramIDHere");

#[program]
pub mod sentinel {
    use super::*;

    /// Register a new training session
    pub fn register_training_session(
        ctx: Context<RegisterTrainingSession>,
        session_id: [u8; 32],
        model_hash: [u8; 32],
        total_rounds: u8,
    ) -> Result<()> {
        let session = &mut ctx.accounts.training_session;
        session.trainer = ctx.accounts.trainer.key();
        session.session_id = session_id;
        session.model_hash = model_hash;
        session.total_rounds = total_rounds;
        session.current_round = 0;
        session.status = TrainingStatus::Pending;
        session.created_at = Clock::get()?.unix_timestamp;
        
        msg!("Training session registered: {:?}", session.session_id);
        Ok(())
    }

    /// Log a contribution from a contributor
    pub fn log_contribution(
        ctx: Context<LogContribution>,
        gradient_hash: [u8; 32],
        accuracy: u16, // Scaled by 1000 (e.g., 850 = 0.85)
        privacy_score: u16, // Scaled by 1000
    ) -> Result<()> {
        let contribution = &mut ctx.accounts.contribution;
        contribution.contributor = ctx.accounts.contributor.key();
        contribution.session = ctx.accounts.training_session.key();
        contribution.round_id = ctx.accounts.training_session.current_round;
        contribution.gradient_hash = gradient_hash;
        contribution.accuracy = accuracy;
        contribution.privacy_score = privacy_score;
        contribution.timestamp = Clock::get()?.unix_timestamp;
        
        msg!("Contribution logged: {:?}", contribution.gradient_hash);
        Ok(())
    }

    /// Distribute rewards to contributors
    pub fn distribute_reward(
        ctx: Context<DistributeReward>,
        amount: u64,
    ) -> Result<()> {
        let reward = &mut ctx.accounts.reward;
        reward.contributor = ctx.accounts.contributor.key();
        reward.session = ctx.accounts.training_session.key();
        reward.amount = amount;
        reward.timestamp = Clock::get()?.unix_timestamp;
        
        // Transfer SPL tokens
        let cpi_accounts = Transfer {
            from: ctx.accounts.from_token_account.to_account_info(),
            to: ctx.accounts.to_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        msg!("Reward distributed: {} tokens to {}", amount, reward.contributor);
        Ok(())
    }

    /// Update training session status
    pub fn update_session_status(
        ctx: Context<UpdateSessionStatus>,
        new_status: u8,
    ) -> Result<()> {
        let session = &mut ctx.accounts.training_session;
        require!(
            session.trainer == ctx.accounts.trainer.key(),
            ErrorCode::Unauthorized
        );
        
        session.status = match new_status {
            0 => TrainingStatus::Pending,
            1 => TrainingStatus::Active,
            2 => TrainingStatus::Completed,
            _ => return Err(ErrorCode::InvalidStatus.into()),
        };
        
        if session.status == TrainingStatus::Completed {
            session.current_round = session.total_rounds;
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(session_id: [u8; 32], model_hash: [u8; 32], total_rounds: u8)]
pub struct RegisterTrainingSession<'info> {
    #[account(mut)]
    pub trainer: Signer<'info>,
    
    #[account(
        init,
        payer = trainer,
        space = 8 + TrainingSession::LEN,
        seeds = [b"training_session", session_id.as_ref()],
        bump
    )]
    pub training_session: Account<'info, TrainingSession>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LogContribution<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,
    
    #[account(mut)]
    pub training_session: Account<'info, TrainingSession>,
    
    #[account(
        init,
        payer = contributor,
        space = 8 + Contribution::LEN,
        seeds = [b"contribution", training_session.key().as_ref(), contributor.key().as_ref()],
        bump
    )]
    pub contribution: Account<'info, Contribution>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeReward<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub contributor: AccountInfo<'info>,
    
    #[account(mut)]
    pub training_session: Account<'info, TrainingSession>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + Reward::LEN,
        seeds = [b"reward", training_session.key().as_ref(), contributor.key().as_ref()],
        bump
    )]
    pub reward: Account<'info, Reward>,
    
    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateSessionStatus<'info> {
    #[account(mut)]
    pub trainer: Signer<'info>,
    
    #[account(mut)]
    pub training_session: Account<'info, TrainingSession>,
}

#[account]
pub struct TrainingSession {
    pub trainer: Pubkey,
    pub session_id: [u8; 32],
    pub model_hash: [u8; 32],
    pub total_rounds: u8,
    pub current_round: u8,
    pub status: TrainingStatus,
    pub created_at: i64,
}

impl TrainingSession {
    pub const LEN: usize = 32 + 32 + 32 + 1 + 1 + 1 + 8;
}

#[account]
pub struct Contribution {
    pub contributor: Pubkey,
    pub session: Pubkey,
    pub round_id: u8,
    pub gradient_hash: [u8; 32],
    pub accuracy: u16,
    pub privacy_score: u16,
    pub timestamp: i64,
}

impl Contribution {
    pub const LEN: usize = 32 + 32 + 1 + 32 + 2 + 2 + 8;
}

#[account]
pub struct Reward {
    pub contributor: Pubkey,
    pub session: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

impl Reward {
    pub const LEN: usize = 32 + 32 + 8 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TrainingStatus {
    Pending = 0,
    Active = 1,
    Completed = 2,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid status")]
    InvalidStatus,
    #[msg("Session not found")]
    SessionNotFound,
    #[msg("Invalid round")]
    InvalidRound,
}

