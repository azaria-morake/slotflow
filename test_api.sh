#!/bin/bash

# SlotFlow API Test Script
# This script provides a robust menu-driven interface to test all SlotFlow API endpoints
# with proper error handling, input validation, and token management.

set -euo pipefail

# Configuration
API_BASE_URL="http://localhost:8000/api"
TOKENS_DIR="./tokens"
MEDIA_DIR="./media"
TIMEOUT_SECONDS=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create necessary directories if they don't exist
mkdir -p "$TOKENS_DIR"
mkdir -p "$MEDIA_DIR"

# --- Utility Functions ---

# Print colored messages
print_success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

print_error() {
    echo -e "${RED}[✗] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[⚠] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[ℹ] $1${NC}"
}

# Validate required input
validate_input() {
    local input="$1"
    local field_name="$2"
    
    if [ -z "$input" ]; then
        print_error "$field_name cannot be empty"
        return 1
    fi
    return 0
}

# Validate email format
validate_email() {
    local email="$1"
    if [[ ! "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        print_error "Invalid email format"
        return 1
    fi
    return 0
}

# Validate date format (YYYY-MM-DD)
validate_date() {
    local date="$1"
    if [[ ! "$date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        print_error "Invalid date format. Use YYYY-MM-DD"
        return 1
    fi
    return 0
}

# Validate numeric input
validate_number() {
    local num="$1"
    local field_name="$2"
    
    if ! [[ "$num" =~ ^[0-9]+$ ]]; then
        print_error "$field_name must be a number"
        return 1
    fi
    return 0
}

# Handle API responses
handle_response() {
    local response="$1"
    local temp_file=$(mktemp)
    
    # Extract status code and body
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    echo "$body" > "$temp_file"
    
    case "$status_code" in
        200|201)
            print_success "Request successful (HTTP $status_code)"
            if command -v jq >/dev/null 2>&1; then
                jq '.' "$temp_file" 2>/dev/null || cat "$temp_file"
            else
                cat "$temp_file"
            fi
            ;;
        204)
            print_success "Request successful - No content (HTTP $status_code)"
            ;;
        400)
            print_error "Bad Request (HTTP $status_code)"
            if command -v jq >/dev/null 2>&1; then
                jq '.detail // .' "$temp_file" 2>/dev/null || cat "$temp_file"
            else
                cat "$temp_file"
            fi
            ;;
        401)
            print_error "Unauthorized (HTTP $status_code) - Invalid credentials or token"
            ;;
        403)
            print_error "Forbidden (HTTP $status_code) - Insufficient permissions"
            ;;
        404)
            print_error "Not Found (HTTP $status_code) - Resource doesn't exist"
            ;;
        409)
            print_error "Conflict (HTTP $status_code) - Resource already exists or conflict"
            ;;
        422)
            print_error "Unprocessable Entity (HTTP $status_code) - Validation error"
            if command -v jq >/dev/null 2>&1; then
                jq '.detail // .' "$temp_file" 2>/dev/null || cat "$temp_file"
            else
                cat "$temp_file"
            fi
            ;;
        500)
            print_error "Internal Server Error (HTTP $status_code) - Server issue"
            ;;
        *)
            print_warning "Unexpected response (HTTP $status_code)"
            cat "$temp_file"
            ;;
    esac
    
    rm -f "$temp_file"
}

# Make API request with timeout and proper headers
make_request() {
    local method="$1"
    local endpoint="$2"
    local headers="$3"
    local data="${4:-}"
    
    local curl_cmd=("curl" "-s" "-w" "\n%{http_code}" "-X" "$method" "$API_BASE_URL$endpoint" "--connect-timeout" "$TIMEOUT_SECONDS")
    
    # Add headers
    IFS=' ' read -r -a headers_array <<< "$headers"
    for header in "${headers_array[@]}"; do
        curl_cmd+=("$header")
    done
    
    # Add data if provided
    if [ -n "$data" ]; then
        curl_cmd+=("-d" "$data")
    fi
    
    # Execute the command
    local response
    if ! response=$("${curl_cmd[@]}"); then
        print_error "Failed to connect to API at $API_BASE_URL"
        return 1
    fi
    
    handle_response "$response"
}

# Make multipart request for file uploads
make_multipart_request() {
    local method="$1"
    local endpoint="$2"
    local headers="$3"
    shift 3
    local form_data=("$@")
    
    local curl_cmd=("curl" "-s" "-w" "\n%{http_code}" "-X" "$method" "$API_BASE_URL$endpoint" "--connect-timeout" "$TIMEOUT_SECONDS")
    
    # Add headers
    IFS=' ' read -r -a headers_array <<< "$headers"
    for header in "${headers_array[@]}"; do
        curl_cmd+=("$header")
    done
    
    # Add form data
    for data in "${form_data[@]}"; do
        curl_cmd+=("$data")
    done
    
    # Execute the command
    local response
    if ! response=$("${curl_cmd[@]}"); then
        print_error "Failed to connect to API at $API_BASE_URL"
        return 1
    fi
    
    handle_response "$response"
}

# Save tokens to files
save_tokens() {
    local username="$1"
    local access_token="$2"
    local refresh_token="${3:-}"
    
    echo "$access_token" > "$TOKENS_DIR/${username}_access.token"
    if [ -n "$refresh_token" ]; then
        echo "$refresh_token" > "$TOKENS_DIR/${username}_refresh.token"
    fi
    print_success "Tokens saved for user: $username"
}

# Load access token from file
load_access_token() {
    local username="$1"
    local token_file="$TOKENS_DIR/${username}_access.token"
    
    if [ -f "$token_file" ]; then
        cat "$token_file"
    else
        print_error "No access token found for user: $username"
        return 1
    fi
}

# Load refresh token from file
load_refresh_token() {
    local username="$1"
    local token_file="$TOKENS_DIR/${username}_refresh.token"
    
    if [ -f "$token_file" ]; then
        cat "$token_file"
    else
        print_error "No refresh token found for user: $username"
        return 1
    fi
}

# Check if media file exists
check_media_file() {
    local filename="$1"
    local filepath="$MEDIA_DIR/$filename"
    
    if [ ! -f "$filepath" ]; then
        print_error "Media file not found: $filepath"
        print_info "Please place your media files in the $MEDIA_DIR directory"
        return 1
    fi
    return 0
}

# Get user input with validation and cancel option
get_input() {
    local prompt="$1"
    local var_name="$2"
    local validation_func="${3:-}"
    local required="${4:-true}"
    
    while true; do
        echo -n "$prompt (or 'cancel' to go back): "
        read -r input
        
        if [ "$input" = "cancel" ]; then
            print_info "Operation cancelled by user"
            return 1
        fi
        
        if [ "$required" = "true" ] && [ -z "$input" ]; then
            print_error "This field is required"
            continue
        fi
        
        if [ -n "$validation_func" ] && [ -n "$input" ]; then
            if ! $validation_func "$input"; then
                continue
            fi
        fi
        
        eval "$var_name='$input'"
        return 0
    done
}

# Confirm action with user
confirm_action() {
    local message="$1"
    
    echo -n "$message (y/N): "
    read -r confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        print_info "Action cancelled"
        return 1
    fi
    return 0
}

# Pause and wait for user input
pause() {
    echo
    echo -n "Press Enter to continue..."
    read -r
}

# --- API Functions ---

# Register a new user
register_user() {
    echo
    print_info "=== User Registration ==="
    
    while true; do
        get_input "Enter username" username "validate_input" || return
        get_input "Enter email" email "validate_email" || return
        get_input "Enter password" password "validate_input" || return
        get_input "Confirm password" password2 "validate_input" || return
        get_input "Enter role (admin/learner)" role "validate_input" || return
        
        if [ "$password" != "$password2" ]; then
            print_error "Passwords do not match"
            continue
        fi
        
        if [ "$role" != "admin" ] && [ "$role" != "learner" ]; then
            print_error "Role must be either 'admin' or 'learner'"
            continue
        fi
        
        break
    done
    
    local json_data="{\"username\": \"$username\", \"email\": \"$email\", \"password\": \"$password\", \"password2\": \"$password2\", \"role\": \"$role\"}"
    
    print_info "Registering user..."
    make_request "POST" "/auth/register/" "-H 'Content-Type: application/json'" "$json_data"
    
    pause
}

# Login user and save tokens
login_user() {
    echo
    print_info "=== User Login ==="
    
    get_input "Enter username" username "validate_input" || return
    get_input "Enter password" password "validate_input" || return
    
    local json_data="{\"username\": \"$username\", \"password\": \"$password\"}"
    
    print_info "Logging in..."
    local response
    if ! response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/auth/token/" \
        -H "Content-Type: application/json" \
        -d "$json_data" \
        --connect-timeout "$TIMEOUT_SECONDS"); then
        print_error "Failed to connect to API"
        pause
        return
    fi
    
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "200" ]; then
        print_success "Login successful!"
        
        # Extract tokens
        local access_token
        local refresh_token
        if command -v jq >/dev/null 2>&1; then
            access_token=$(echo "$body" | jq -r '.access')
            refresh_token=$(echo "$body" | jq -r '.refresh')
        else
            access_token=$(echo "$body" | sed -n 's/.*"access":"\([^"]*\)".*/\1/p')
            refresh_token=$(echo "$body" | sed -n 's/.*"refresh":"\([^"]*\)".*/\1/p')
        fi
        
        if [ -z "$access_token" ] || [ -z "$refresh_token" ]; then
            print_error "Failed to extract tokens from response"
            echo "$body"
        else
            save_tokens "$username" "$access_token" "$refresh_token"
            echo "$body" | (command -v jq >/dev/null 2>&1 && jq '.' || cat)
        fi
    else
        handle_response "$response"
    fi
    
    pause
}

# Refresh access token
refresh_token() {
    echo
    print_info "=== Refresh Token ==="
    
    get_input "Enter username" username "validate_input" || return
    
    local refresh_token
    if ! refresh_token=$(load_refresh_token "$username"); then
        pause
        return
    fi
    
    local json_data="{\"refresh\": \"$refresh_token\"}"
    
    print_info "Refreshing token..."
    local response
    if ! response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/auth/token/refresh/" \
        -H "Content-Type: application/json" \
        -d "$json_data" \
        --connect-timeout "$TIMEOUT_SECONDS"); then
        print_error "Failed to connect to API"
        pause
        return
    fi
    
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "200" ]; then
        print_success "Token refreshed successfully!"
        
        local new_access_token
        if command -v jq >/dev/null 2>&1; then
            new_access_token=$(echo "$body" | jq -r '.access')
        else
            new_access_token=$(echo "$body" | sed -n 's/.*"access":"\([^"]*\)".*/\1/p')
        fi
        
        if [ -z "$new_access_token" ]; then
            print_error "Failed to extract new access token from response"
            echo "$body"
        else
            save_tokens "$username" "$new_access_token"
            echo "$body" | (command -v jq >/dev/null 2>&1 && jq '.' || cat)
        fi
    else
        handle_response "$response"
    fi
    
    pause
}

# Logout user and remove tokens
logout_user() {
    echo
    print_info "=== User Logout ==="
    
    get_input "Enter username" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    local refresh_token
    if ! refresh_token=$(load_refresh_token "$username"); then
        pause
        return
    fi
    
    if ! confirm_action "Are you sure you want to logout $username?"; then
        return
    fi
    
    local json_data="{\"refresh_token\": \"$refresh_token\"}"
    
    print_info "Logging out..."
    make_request "POST" "/auth/logout/" "-H 'Authorization: Bearer $access_token' -H 'Content-Type: application/json'" "$json_data"
    
    # Remove tokens regardless of API response
    rm -f "$TOKENS_DIR/${username}_access.token"
    rm -f "$TOKENS_DIR/${username}_refresh.token"
    print_success "Tokens removed for user: $username"
    
    pause
}

# Change user password
change_password() {
    echo
    print_info "=== Change Password ==="
    
    get_input "Enter username" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    get_input "Enter current password" current_password "validate_input" || return
    get_input "Enter new password" new_password "validate_input" || return
    get_input "Confirm new password" new_password_confirmation "validate_input" || return
    
    if [ "$new_password" != "$new_password_confirmation" ]; then
        print_error "New passwords do not match"
        pause
        return
    fi
    
    local json_data="{\"current_password\": \"$current_password\", \"new_password\": \"$new_password\", \"new_password_confirmation\": \"$new_password_confirmation\"}"
    
    print_info "Changing password..."
    make_request "POST" "/auth/change-password/" "-H 'Authorization: Bearer $access_token' -H 'Content-Type: application/json'" "$json_data"
    
    pause
}

# Upload profile picture
upload_profile_picture() {
    echo
    print_info "=== Upload Profile Picture ==="
    
    get_input "Enter username" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    get_input "Enter image filename (in $MEDIA_DIR/)" filename "validate_input" || return
    
    if ! check_media_file "$filename"; then
        pause
        return
    fi
    
    print_info "Uploading profile picture..."
    make_multipart_request "PUT" "/auth/me/profile-picture/" "-H 'Authorization: Bearer $access_token'" \
        "-F" "profile_picture=@$MEDIA_DIR/$filename"
    
    pause
}

# Delete profile picture
delete_profile_picture() {
    echo
    print_info "=== Delete Profile Picture ==="
    
    get_input "Enter username" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    if ! confirm_action "Are you sure you want to delete your profile picture?"; then
        return
    fi
    
    print_info "Deleting profile picture..."
    make_request "DELETE" "/auth/me/profile-picture/" "-H 'Authorization: Bearer $access_token'"
    
    pause
}

# Create a new course
create_course() {
    echo
    print_info "=== Create Course ==="
    
    get_input "Enter username (admin)" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    get_input "Enter course title" title "validate_input" || return
    get_input "Enter description" description "validate_input" || return
    
    while true; do
        get_input "Enter start date (YYYY-MM-DD)" start_date "validate_date" || return
        get_input "Enter end date (YYYY-MM-DD)" end_date "validate_date" || return
        
        if [[ "$start_date" > "$end_date" ]]; then
            print_error "End date must be after start date"
            continue
        fi
        break
    done
    
    get_input "Enter duration in hours" duration_hours "validate_number" || return
    get_input "Enter languages (comma-separated, e.g., English,Zulu)" languages "validate_input" || return
    get_input "Enter total slots" slots_total "validate_number" || return
    get_input "Enter course picture filename (optional, in $MEDIA_DIR/)" course_picture "" false || return
    
    # Prepare form data
    local form_data=(
        "-F" "title=$title"
        "-F" "description=$description"
        "-F" "start_date=$start_date"
        "-F" "end_date=$end_date"
        "-F" "duration_hours=$duration_hours"
        "-F" "slots_total=$slots_total"
    )
    
    # Add languages
    IFS=',' read -ra LANG_ARRAY <<< "$languages"
    for lang in "${LANG_ARRAY[@]}"; do
        form_data+=("-F" "languages=$(echo "$lang" | xargs)")
    done
    
    # Add course picture if provided
    if [ -n "$course_picture" ] && check_media_file "$course_picture"; then
        form_data+=("-F" "course_picture=@$MEDIA_DIR/$course_picture")
    fi
    
    print_info "Creating course..."
    make_multipart_request "POST" "/courses/" "-H 'Authorization: Bearer $access_token'" "${form_data[@]}"
    
    pause
}

# Update course details
update_course() {
    echo
    print_info "=== Update Course ==="
    
    get_input "Enter username (admin)" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    get_input "Enter course ID" course_id "validate_number" || return
    
    # Get current course details to show what can be updated
    print_info "Fetching current course details..."
    make_request "GET" "/courses/$course_id/" "-H 'Authorization: Bearer $access_token'"
    
    echo
    print_info "Enter new values (leave blank to keep current):"
    
    get_input "Enter new description" description "" false || return
    
    local form_data=()
    if [ -n "$description" ]; then
        form_data+=("-F" "description=$description")
    fi
    
    if [ ${#form_data[@]} -eq 0 ]; then
        print_warning "No fields to update provided."
        pause
        return
    fi
    
    print_info "Updating course..."
    make_multipart_request "PATCH" "/courses/$course_id/" "-H 'Authorization: Bearer $access_token'" "${form_data[@]}"
    
    pause
}

# Upload course picture
upload_course_picture() {
    echo
    print_info "=== Upload Course Picture ==="
    
    get_input "Enter username (admin)" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    get_input "Enter course ID" course_id "validate_number" || return
    get_input "Enter image filename (in $MEDIA_DIR/)" filename "validate_input" || return
    
    if ! check_media_file "$filename"; then
        pause
        return
    fi
    
    print_info "Uploading course picture..."
    make_multipart_request "PUT" "/courses/$course_id/course-picture/" "-H 'Authorization: Bearer $access_token'" \
        "-F" "course_picture=@$MEDIA_DIR/$filename"
    
    pause
}

# Delete course picture
delete_course_picture() {
    echo
    print_info "=== Delete Course Picture ==="
    
    get_input "Enter username (admin)" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    get_input "Enter course ID" course_id "validate_number" || return
    
    if ! confirm_action "Are you sure you want to delete the course picture?"; then
        return
    fi
    
    print_info "Deleting course picture..."
    make_request "DELETE" "/courses/$course_id/course-picture/" "-H 'Authorization: Bearer $access_token'"
    
    pause
}

# Get all courses
get_all_courses() {
    echo
    print_info "=== Get All Courses ==="
    
    print_info "Fetching all courses..."
    make_request "GET" "/courses/"
    
    pause
}

# Get specific course details
get_course() {
    echo
    print_info "=== Get Course Details ==="
    
    get_input "Enter course ID" course_id "validate_number" || return
    
    print_info "Fetching course details..."
    make_request "GET" "/courses/$course_id/"
    
    pause
}

# Delete a course
delete_course() {
    echo
    print_info "=== Delete Course ==="
    
    get_input "Enter username (admin)" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    get_input "Enter course ID" course_id "validate_number" || return
    
    if ! confirm_action "Are you sure you want to delete course $course_id? This cannot be undone."; then
        return
    fi
    
    print_info "Deleting course..."
    make_request "DELETE" "/courses/$course_id/" "-H 'Authorization: Bearer $access_token'"
    
    pause
}

# Book a course
book_course() {
    echo
    print_info "=== Book Course ==="
    
    get_input "Enter username (learner)" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    get_input "Enter course ID" course_id "validate_number" || return
    
    local json_data="{\"course\": $course_id}"
    
    print_info "Booking course..."
    make_request "POST" "/bookings/" "-H 'Authorization: Bearer $access_token' -H 'Content-Type: application/json'" "$json_data"
    
    pause
}

# View user bookings
view_bookings() {
    echo
    print_info "=== View My Bookings ==="
    
    get_input "Enter username (learner)" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    print_info "Fetching bookings..."
    make_request "GET" "/bookings/" "-H 'Authorization: Bearer $access_token'"
    
    pause
}

# Cancel a booking
cancel_booking() {
    echo
    print_info "=== Cancel Booking ==="
    
    get_input "Enter username (learner)" username "validate_input" || return
    
    local access_token
    if ! access_token=$(load_access_token "$username"); then
        pause
        return
    fi
    
    get_input "Enter booking ID" booking_id "validate_number" || return
    
    if ! confirm_action "Are you sure you want to cancel booking $booking_id?"; then
        return
    fi
    
    local json_data="{\"confirm\": true}"
    
    print_info "Cancelling booking..."
    make_request "PATCH" "/bookings/$booking_id/cancel/" "-H 'Authorization: Bearer $access_token' -H 'Content-Type: application/json'" "$json_data"
    
    pause
}

# View saved tokens
view_saved_tokens() {
    clear
    echo "=================================="
    echo "       Saved Tokens"
    echo "=================================="
    echo
    
    if [ ! -d "$TOKENS_DIR" ] || [ -z "$(ls -A "$TOKENS_DIR" 2>/dev/null)" ]; then
        print_info "No saved tokens found."
    else
        for token_file in "$TOKENS_DIR"/*_access.token; do
            if [ -f "$token_file" ]; then
                local username=$(basename "$token_file" _access.token)
                local access_token=$(head -c 20 "$token_file")
                local refresh_file="$TOKENS_DIR/${username}_refresh.token"
                
                echo "User: $username"
                echo "Access Token: ${access_token}..."
                if [ -f "$refresh_file" ]; then
                    local refresh_token=$(head -c 20 "$refresh_file")
                    echo "Refresh Token: ${refresh_token}..."
                fi
                echo "---"
            fi
        done
    fi
    
    pause
}

# --- Menu Functions ---

show_main_menu() {
    clear
    echo "=================================="
    echo "    SlotFlow API Test Script"
    echo "=================================="
    echo
    echo "1. Authentication Menu"
    echo "2. Profile Menu"
    echo "3. Course Management Menu"
    echo "4. Booking Menu"
    echo "5. View Saved Tokens"
    echo "0. Exit"
    echo
}

show_auth_menu() {
    clear
    echo "=================================="
    echo "      Authentication Menu"
    echo "=================================="
    echo
    echo "1. Register User"
    echo "2. Login User"
    echo "3. Refresh Token"
    echo "4. Logout User"
    echo "5. Change Password"
    echo "0. Back to Main Menu"
    echo
}

show_profile_menu() {
    clear
    echo "=================================="
    echo "        Profile Menu"
    echo "=================================="
    echo
    echo "1. Upload Profile Picture"
    echo "2. Delete Profile Picture"
    echo "0. Back to Main Menu"
    echo
}

show_course_menu() {
    clear
    echo "=================================="
    echo "    Course Management Menu"
    echo "=================================="
    echo
    echo "1. Create Course"
    echo "2. Update Course"
    echo "3. Upload Course Picture"
    echo "4. Delete Course Picture"
    echo "5. Get All Courses"
    echo "6. Get Course Details"
    echo "7. Delete Course"
    echo "0. Back to Main Menu"
    echo
}

show_booking_menu() {
    clear
    echo "=================================="
    echo "        Booking Menu"
    echo "=================================="
    echo
    echo "1. Book Course"
    echo "2. View My Bookings"
    echo "3. Cancel Booking"
    echo "0. Back to Main Menu"
    echo
}

# --- Main Execution ---

main() {
    # Check for jq
    if ! command -v jq >/dev/null 2>&1; then
        print_warning "jq is not installed. JSON responses will be displayed as raw text."
        print_info "Install jq for better JSON formatting: sudo apt-get install jq"
        echo
    fi
    
    # Check API connectivity
    print_info "Checking API connectivity..."
    if ! curl -s --connect-timeout "$TIMEOUT_SECONDS" "$API_BASE_URL/courses/" >/dev/null; then
        print_error "Cannot connect to API at $API_BASE_URL"
        print_info "Please ensure the SlotFlow API server is running on localhost:8000"
        exit 1
    fi
    print_success "API is accessible"
    sleep 1
    
    # Main menu loop
    while true; do
        show_main_menu
        echo -n "Choose an option (0-5): "
        read -r choice
        
        case $choice in
            1)
                while true; do
                    show_auth_menu
                    echo -n "Choose an option (0-5): "
                    read -r auth_choice
                    
                    case $auth_choice in
                        1) register_user ;;
                        2) login_user ;;
                        3) refresh_token ;;
                        4) logout_user ;;
                        5) change_password ;;
                        0) break ;;
                        *) print_error "Invalid option. Please enter a number between 0-5." && sleep 1 ;;
                    esac
                done
                ;;
            2)
                while true; do
                    show_profile_menu
                    echo -n "Choose an option (0-2): "
                    read -r profile_choice
                    
                    case $profile_choice in
                        1) upload_profile_picture ;;
                        2) delete_profile_picture ;;
                        0) break ;;
                        *) print_error "Invalid option. Please enter a number between 0-2." && sleep 1 ;;
                    esac
                done
                ;;
            3)
                while true; do
                    show_course_menu
                    echo -n "Choose an option (0-7): "
                    read -r course_choice
                    
                    case $course_choice in
                        1) create_course ;;
                        2) update_course ;;
                        3) upload_course_picture ;;
                        4) delete_course_picture ;;
                        5) get_all_courses ;;
                        6) get_course ;;
                        7) delete_course ;;
                        0) break ;;
                        *) print_error "Invalid option. Please enter a number between 0-7." && sleep 1 ;;
                    esac
                done
                ;;
            4)
                while true; do
                    show_booking_menu
                    echo -n "Choose an option (0-3): "
                    read -r booking_choice
                    
                    case $booking_choice in
                        1) book_course ;;
                        2) view_bookings ;;
                        3) cancel_booking ;;
                        0) break ;;
                        *) print_error "Invalid option. Please enter a number between 0-3." && sleep 1 ;;
                    esac
                done
                ;;
            5) view_saved_tokens ;;
            0) 
                print_info "Thank you for using SlotFlow API Test Script!"
                exit 0
                ;;
            *) 
                print_error "Invalid option. Please enter a number between 0-5."
                sleep 1
                ;;
        esac
    done
}

# Run the main function
main "$@"