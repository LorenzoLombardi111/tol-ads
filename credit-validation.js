// Credit validation function to add to App.js
const checkAndDeductCredit = async (userId) => {
  try {
    // Check if user has enough credits
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('credits_available')
      .eq('user_id', userId)
      .single();

    if (creditsError) {
      console.error('Error checking credits:', creditsError);
      return { success: false, error: 'Unable to check your credits. Please try again.' };
    }

    const availableCredits = userCredits?.credits_available || 0;
    if (availableCredits < 1) {
      return { success: false, error: 'You don\'t have enough credits to generate ads. Please purchase more credits.' };
    }

    // Deduct 1 credit
    const { data: creditResult, error: deductionError } = await supabase
      .rpc('update_user_credits', {
        target_user_id: userId,
        credit_change: -1,
        transaction_type: 'usage',
        description: 'Ad generation - 1 credit used'
      });

    if (deductionError) {
      console.error('Error deducting credits:', deductionError);
      return { success: false, error: 'Failed to process credits. Please try again.' };
    }

    if (!creditResult.success) {
      return { success: false, error: creditResult.error || 'Failed to process credits.' };
    }

    return { success: true, creditsRemaining: creditResult.new_credits_available };
  } catch (error) {
    console.error('Error in credit validation:', error);
    return { success: false, error: 'Unable to verify your credits. Please try again.' };
  }
};

// Usage in generateAds function:
// const creditCheck = await checkAndDeductCredit(userData.id);
// if (!creditCheck.success) {
//   setError(creditCheck.error);
//   return;
// } 