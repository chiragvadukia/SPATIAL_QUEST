const messages = {

    // Authorization
    invalid_credentials: "The credentials you entered are incorrect.",
    login_successful: "Login successful! Welcome back.",
    registration_successful: "Registration completed successfully!",
    invalid_id: "The provided ID is not valid.",
    logout_successful: "You have been logged out successfully.",
    unauthorized: "You are not authorized to access this page.",
    user_not_found: "No user found with the given details.",

    // Quest
    quest_found: "Quest list retrieved successfully.",
    quest_joined: "You have successfully joined the quest.",
    quest_not_joined: "You haven't joined this quest yet.",
    quest_not_nearby: "You're not within the nearby range of the quest location.",
    quest_already_joined: "You’ve already joined this quest.",
    quest_left: "You’ve left the quest successfully.",

    // Quest Asset
    quest_asset_collected: "Quest asset collected successfully!",
    quest_asset_not_collected: "Quest asset cannot be collected at this time.",
    quest_asset_already_collected: "This quest asset has already been collected.",
    no_quest_asset_found: "No quest assets found.",
    quest_collected: "You’ve successfully collected all quest assets!",

    // Showcase
    location_outside_quest: "You can only showcase within the quest area.",
    quest_incomplete: "Complete the quest before adding it to your showcase.",
    added_to_showcase: "Quest has been added to your public showcase!",
    removed_to_showcase: "Quest has been removed from your public showcase.",

    // Admin
    quest_added: "Quest added successfully!",
    quest_asset_added: "Quest asset added successfully!",

    // Common
    internal_server_err: "Something went wrong. Please try again later.",
    no_data_found: "No data available.",
    data_found: "Data retrieved successfully!",
    file_size: "File size must be under 20MB.",
    file_limit: "You can only upload one file.",
};

export default messages;
