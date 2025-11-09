use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("FlexAIPr0gramID1111111111111111111111");

#[program]
pub mod flexai {
    use super::*;

    /// Create a new AI fine-tuning challenge
    pub fn create_challenge(
        ctx: Context<CreateChallenge>,
        challenge_id: [u8; 32],
        reward_amount: u64,
        deadline: i64,
        baseline_accuracy: u16, // Scaled by 1000 (e.g., 850 = 0.85)
    ) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        challenge.creator = ctx.accounts.creator.key();
        challenge.challenge_id = challenge_id;
        challenge.reward_amount = reward_amount;
        challenge.deadline = deadline;
        challenge.baseline_accuracy = baseline_accuracy;
        challenge.status = ChallengeStatus::Active;
        challenge.total_submissions = 0;
        challenge.approved_submissions = 0;
        challenge.created_at = Clock::get()?.unix_timestamp;
        
        msg!("Challenge created: {:?}", challenge.challenge_id);
        Ok(())
    }

    /// Submit a fine-tuned model for a challenge
    pub fn submit_model(
        ctx: Context<SubmitModel>,
        model_hash: [u8; 32],
        accuracy: u16, // Scaled by 1000
        metadata_hash: [u8; 32], // IPFS hash of model metadata
    ) -> Result<()> {
        let submission = &mut ctx.accounts.submission;
        let challenge = &mut ctx.accounts.challenge;
        
        require!(
            challenge.status == ChallengeStatus::Active,
            ErrorCode::ChallengeNotActive
        );
        require!(
            Clock::get()?.unix_timestamp < challenge.deadline,
            ErrorCode::ChallengeExpired
        );
        
        submission.contributor = ctx.accounts.contributor.key();
        submission.challenge = challenge.key();
        submission.model_hash = model_hash;
        submission.accuracy = accuracy;
        submission.metadata_hash = metadata_hash;
        submission.status = SubmissionStatus::Pending;
        submission.submitted_at = Clock::get()?.unix_timestamp;
        
        challenge.total_submissions += 1;
        
        msg!("Model submitted: {:?}", submission.model_hash);
        Ok(())
    }

    /// Approve a model submission and release reward
    pub fn approve_model(
        ctx: Context<ApproveModel>,
    ) -> Result<()> {
        let submission = &mut ctx.accounts.submission;
        let challenge = &mut ctx.accounts.challenge;
        let contributor_reputation = &mut ctx.accounts.contributor_reputation;
        
        require!(
            submission.status == SubmissionStatus::Pending,
            ErrorCode::SubmissionAlreadyProcessed
        );
        require!(
            challenge.status == ChallengeStatus::Active,
            ErrorCode::ChallengeNotActive
        );
        
        // Update submission status
        submission.status = SubmissionStatus::Approved;
        submission.approved_at = Clock::get()?.unix_timestamp;
        
        // Update challenge stats
        challenge.approved_submissions += 1;
        
        // Update contributor reputation
        contributor_reputation.total_approved += 1;
        contributor_reputation.total_rewards += challenge.reward_amount;
        
        // Transfer reward to contributor
        let cpi_accounts = Transfer {
            from: ctx.accounts.reward_vault.to_account_info(),
            to: ctx.accounts.contributor_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(
            cpi_program,
            cpi_accounts,
            &[&[
                b"reward_vault",
                challenge.key().as_ref(),
                &[ctx.bumps.reward_vault],
            ]],
        );
        token::transfer(cpi_ctx, challenge.reward_amount)?;
        
        msg!("Model approved and reward distributed: {} tokens", challenge.reward_amount);
        Ok(())
    }

    /// Reject a model submission
    pub fn reject_model(
        ctx: Context<RejectModel>,
        reason: String,
    ) -> Result<()> {
        let submission = &mut ctx.accounts.submission;
        
        require!(
            submission.status == SubmissionStatus::Pending,
            ErrorCode::SubmissionAlreadyProcessed
        );
        
        submission.status = SubmissionStatus::Rejected;
        submission.rejection_reason = reason;
        submission.rejected_at = Clock::get()?.unix_timestamp;
        
        msg!("Model rejected: {:?}", submission.model_hash);
        Ok(())
    }

    /// Initialize contributor reputation account
    pub fn initialize_reputation(
        ctx: Context<InitializeReputation>,
    ) -> Result<()> {
        let reputation = &mut ctx.accounts.contributor_reputation;
        reputation.contributor = ctx.accounts.contributor.key();
        reputation.total_approved = 0;
        reputation.total_rejected = 0;
        reputation.total_rewards = 0;
        reputation.rank = 0;
        reputation.created_at = Clock::get()?.unix_timestamp;
        
        msg!("Reputation initialized for: {}", reputation.contributor);
        Ok(())
    }

    /// Close a challenge (only creator can do this)
    pub fn close_challenge(
        ctx: Context<CloseChallenge>,
    ) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        
        require!(
            challenge.creator == ctx.accounts.creator.key(),
            ErrorCode::Unauthorized
        );
        
        challenge.status = ChallengeStatus::Closed;
        challenge.closed_at = Clock::get()?.unix_timestamp;
        
        msg!("Challenge closed: {:?}", challenge.challenge_id);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(challenge_id: [u8; 32], reward_amount: u64, deadline: i64, baseline_accuracy: u16)]
pub struct CreateChallenge<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + Challenge::LEN,
        seeds = [b"challenge", challenge_id.as_ref()],
        bump
    )]
    pub challenge: Account<'info, Challenge>,
    
    #[account(
        init,
        payer = creator,
        token::mint = token_mint,
        token::authority = reward_vault,
        seeds = [b"reward_vault", challenge.key().as_ref()],
        bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    
    pub token_mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitModel<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,
    
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    
    #[account(
        init,
        payer = contributor,
        space = 8 + Submission::LEN,
        seeds = [b"submission", challenge.key().as_ref(), contributor.key().as_ref()],
        bump
    )]
    pub submission: Account<'info, Submission>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveModel<'info> {
    pub authority: Signer<'info>, // Moderator/Admin
    
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    
    #[account(mut)]
    pub submission: Account<'info, Submission>,
    
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + ContributorReputation::LEN,
        seeds = [b"reputation", submission.contributor.as_ref()],
        bump
    )]
    pub contributor_reputation: Account<'info, ContributorReputation>,
    
    #[account(mut)]
    pub reward_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub contributor_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RejectModel<'info> {
    pub authority: Signer<'info>, // Moderator/Admin
    
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    
    #[account(mut)]
    pub submission: Account<'info, Submission>,
}

#[derive(Accounts)]
pub struct InitializeReputation<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,
    
    #[account(
        init,
        payer = contributor,
        space = 8 + ContributorReputation::LEN,
        seeds = [b"reputation", contributor.key().as_ref()],
        bump
    )]
    pub contributor_reputation: Account<'info, ContributorReputation>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseChallenge<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
}

#[account]
pub struct Challenge {
    pub creator: Pubkey,
    pub challenge_id: [u8; 32],
    pub reward_amount: u64,
    pub deadline: i64,
    pub baseline_accuracy: u16,
    pub status: ChallengeStatus,
    pub total_submissions: u32,
    pub approved_submissions: u32,
    pub created_at: i64,
    pub closed_at: Option<i64>,
}

impl Challenge {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 2 + 1 + 4 + 4 + 8 + 9; // 108 bytes
}

#[account]
pub struct Submission {
    pub contributor: Pubkey,
    pub challenge: Pubkey,
    pub model_hash: [u8; 32],
    pub accuracy: u16,
    pub metadata_hash: [u8; 32],
    pub status: SubmissionStatus,
    pub submitted_at: i64,
    pub approved_at: Option<i64>,
    pub rejected_at: Option<i64>,
    pub rejection_reason: Option<String>,
}

impl Submission {
    pub const LEN: usize = 32 + 32 + 32 + 2 + 32 + 1 + 8 + 9 + 9 + 100; // ~265 bytes (approximate for String)
}

#[account]
pub struct ContributorReputation {
    pub contributor: Pubkey,
    pub total_approved: u32,
    pub total_rejected: u32,
    pub total_rewards: u64,
    pub rank: u32,
    pub created_at: i64,
}

impl ContributorReputation {
    pub const LEN: usize = 32 + 4 + 4 + 8 + 4 + 8; // 60 bytes
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ChallengeStatus {
    Active = 0,
    Closed = 1,
    Expired = 2,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum SubmissionStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Challenge not active")]
    ChallengeNotActive,
    #[msg("Challenge expired")]
    ChallengeExpired,
    #[msg("Submission already processed")]
    SubmissionAlreadyProcessed,
    #[msg("Invalid accuracy")]
    InvalidAccuracy,
    #[msg("Insufficient reward funds")]
    InsufficientRewardFunds,
}