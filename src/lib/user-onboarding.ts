import { createServiceClient } from "@/lib/supabase/service";

export interface UserOnboardingStatus {
    hasOnboarded: boolean;
    hasSeenTour: boolean;
    isNewUser: boolean;
}

/**
 * Retrieves the onboarding and product tour status for a given user email.
 * - If the user has a record in Supabase Auth, reads their metadata.
 * - If not, checks if they have existing meetings or records (existing user).
 * - If they have no existing records, registers them as a brand new user.
 */
export async function getUserOnboardingStatus(email: string): Promise<UserOnboardingStatus> {
    if (!email) {
        return { hasOnboarded: true, hasSeenTour: true, isNewUser: false };
    }

    try {
        const supabase = createServiceClient();

        // 1. Check if user already exists in Supabase Auth
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 100,
        });

        if (!listError && listData?.users) {
            const existingUser = listData.users.find(
                (u) => u.email?.toLowerCase() === email.toLowerCase()
            );

            if (existingUser) {
                const metadata = existingUser.user_metadata || {};
                const hasOnboarded = metadata.has_onboarded === true;
                const hasSeenTour = metadata.has_seen_tour === true;
                const isNewUser = metadata.is_new_user === true;

                return {
                    hasOnboarded,
                    hasSeenTour,
                    isNewUser,
                };
            }
        }

        // 2. User is not yet in Supabase Auth.
        // Check if this user has any existing data in the database (e.g. meetings)
        const { count, error: countError } = await supabase
            .from("meetings")
            .select("id", { count: "exact", head: true })
            .eq("user_id", email);

        const hasExistingData = !countError && typeof count === "number" && count > 0;

        if (hasExistingData) {
            // Existing user: mark as already onboarded and tour seen
            try {
                await supabase.auth.admin.createUser({
                    email,
                    email_confirm: true,
                    user_metadata: {
                        has_onboarded: true,
                        has_seen_tour: true,
                        is_new_user: false,
                    },
                });
            } catch (err) {
                console.warn("Could not create Supabase auth record for existing user:", err);
            }

            return {
                hasOnboarded: true,
                hasSeenTour: true,
                isNewUser: false,
            };
        }

        // 3. Brand new user who just signed up for the first time
        try {
            await supabase.auth.admin.createUser({
                email,
                email_confirm: true,
                user_metadata: {
                    has_onboarded: false,
                    has_seen_tour: false,
                    is_new_user: true,
                },
            });
        } catch (err) {
            console.warn("Could not create Supabase auth record for new user:", err);
        }

        return {
            hasOnboarded: false,
            hasSeenTour: false,
            isNewUser: true,
        };
    } catch (error) {
        console.error("Error in getUserOnboardingStatus:", error);
        // Fallback to existing user so we never trap or annoy users with popups on error
        return {
            hasOnboarded: true,
            hasSeenTour: true,
            isNewUser: false,
        };
    }
}

/**
 * Marks the user as having completed the initial onboarding wizard.
 */
export async function markUserOnboarded(email: string): Promise<void> {
    if (!email) return;

    try {
        const supabase = createServiceClient();
        const { data: listData } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 100,
        });

        const user = listData?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (user) {
            await supabase.auth.admin.updateUserById(user.id, {
                user_metadata: {
                    ...user.user_metadata,
                    has_onboarded: true,
                },
            });
        } else {
            await supabase.auth.admin.createUser({
                email,
                email_confirm: true,
                user_metadata: {
                    has_onboarded: true,
                    has_seen_tour: false,
                    is_new_user: true,
                },
            });
        }
    } catch (error) {
        console.error("Error in markUserOnboarded:", error);
    }
}

/**
 * Marks the product tour as seen for the user.
 * Ensures the onboarding popups will never show again for this user on any device.
 */
export async function markUserTourSeen(email: string): Promise<void> {
    if (!email) return;

    try {
        const supabase = createServiceClient();
        const { data: listData } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 100,
        });

        const user = listData?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (user) {
            await supabase.auth.admin.updateUserById(user.id, {
                user_metadata: {
                    ...user.user_metadata,
                    has_onboarded: true,
                    has_seen_tour: true,
                    is_new_user: false,
                },
            });
        } else {
            await supabase.auth.admin.createUser({
                email,
                email_confirm: true,
                user_metadata: {
                    has_onboarded: true,
                    has_seen_tour: true,
                    is_new_user: false,
                },
            });
        }
    } catch (error) {
        console.error("Error in markUserTourSeen:", error);
    }
}
