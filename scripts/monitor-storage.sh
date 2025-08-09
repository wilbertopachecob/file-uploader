#!/bin/bash

# Storage monitoring script for file uploader
# Run this script periodically to monitor disk usage and get alerts

# Configuration
UPLOADS_DIR="../server/uploads"
LOG_FILE="../server/logs/storage-monitor.log"
ALERT_THRESHOLD=80  # Alert when storage exceeds 80%
MAX_STORAGE_GB=5    # Maximum allowed storage in GB

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to get directory size in bytes
get_dir_size() {
    if [ -d "$1" ]; then
        du -sb "$1" 2>/dev/null | cut -f1
    else
        echo "0"
    fi
}

# Function to convert bytes to human readable
bytes_to_human() {
    local bytes=$1
    if [ "$bytes" -lt 1024 ]; then
        echo "${bytes} B"
    elif [ "$bytes" -lt 1048576 ]; then
        echo "$(($bytes / 1024)) KB"
    elif [ "$bytes" -lt 1073741824 ]; then
        echo "$(($bytes / 1048576)) MB"
    else
        echo "$(($bytes / 1073741824)) GB"
    fi
}

# Function to count files
count_files() {
    if [ -d "$1" ]; then
        find "$1" -type f | wc -l
    else
        echo "0"
    fi
}

# Main monitoring function
monitor_storage() {
    log_message "=== Storage Monitor Check ==="
    
    # Get current storage usage
    total_size=$(get_dir_size "$UPLOADS_DIR")
    total_files=$(count_files "$UPLOADS_DIR")
    max_bytes=$((MAX_STORAGE_GB * 1024 * 1024 * 1024))
    usage_percent=$((total_size * 100 / max_bytes))
    
    # Get disk space
    disk_usage=$(df -h "$(dirname "$UPLOADS_DIR")" | tail -1)
    
    # Display current status
    echo -e "${GREEN}Storage Status Report${NC}"
    echo "===================="
    echo "Upload Directory: $UPLOADS_DIR"
    echo "Total Files: $total_files"
    echo "Total Size: $(bytes_to_human $total_size)"
    echo "Max Allowed: ${MAX_STORAGE_GB}GB"
    echo "Usage: ${usage_percent}%"
    echo ""
    echo "Disk Usage:"
    echo "$disk_usage"
    echo ""
    
    # Log the status
    log_message "Files: $total_files, Size: $(bytes_to_human $total_size), Usage: ${usage_percent}%"
    
    # Check if we need to alert
    if [ "$usage_percent" -gt "$ALERT_THRESHOLD" ]; then
        echo -e "${RED}⚠️  ALERT: Storage usage exceeds ${ALERT_THRESHOLD}%!${NC}"
        log_message "ALERT: Storage usage exceeds threshold ($usage_percent% > $ALERT_THRESHOLD%)"
        
        # Show largest files
        echo -e "${YELLOW}Largest files:${NC}"
        find "$UPLOADS_DIR" -type f -exec du -h {} + 2>/dev/null | sort -rh | head -10
        
        # Suggest cleanup
        echo ""
        echo -e "${YELLOW}Cleanup suggestions:${NC}"
        echo "1. Remove old files: find $UPLOADS_DIR -type f -mtime +30 -delete"
        echo "2. Check for duplicate files"
        echo "3. Increase storage limits if needed"
        
        return 1
    elif [ "$usage_percent" -gt 60 ]; then
        echo -e "${YELLOW}⚠️  Warning: Storage usage is getting high (${usage_percent}%)${NC}"
        log_message "WARNING: Storage usage is getting high ($usage_percent%)"
    else
        echo -e "${GREEN}✅ Storage usage is normal (${usage_percent}%)${NC}"
    fi
    
    return 0
}

# Function to clean old files
cleanup_old_files() {
    local days=${1:-30}
    echo -e "${YELLOW}Cleaning files older than $days days...${NC}"
    
    if [ -d "$UPLOADS_DIR" ]; then
        # Count files to be deleted
        old_files=$(find "$UPLOADS_DIR" -type f -mtime +$days | wc -l)
        
        if [ "$old_files" -gt 0 ]; then
            echo "Found $old_files files older than $days days"
            read -p "Do you want to delete them? (y/N): " -n 1 -r
            echo
            
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                find "$UPLOADS_DIR" -type f -mtime +$days -delete
                log_message "Deleted $old_files files older than $days days"
                echo -e "${GREEN}Cleanup completed!${NC}"
            else
                echo "Cleanup cancelled"
            fi
        else
            echo "No files older than $days days found"
        fi
    else
        echo "Uploads directory not found: $UPLOADS_DIR"
    fi
}

# Function to show top users by upload size
show_top_users() {
    echo -e "${GREEN}Top users by upload size:${NC}"
    if [ -d "$UPLOADS_DIR" ]; then
        # Group files by IP pattern in filename and sum sizes
        find "$UPLOADS_DIR" -type f -name "*-*-*-*-*" | \
        while read file; do
            # Extract IP-like pattern from filename
            ip=$(basename "$file" | grep -oE '[0-9]+-[0-9]+-[0-9]+-[0-9]+' | head -1 | tr '-' '.')
            if [ -n "$ip" ]; then
                size=$(stat -c%s "$file" 2>/dev/null || echo 0)
                echo "$ip $size"
            fi
        done | \
        awk '{sizes[$1] += $2; files[$1]++} END {for (ip in sizes) printf "%s: %d files, %.2f MB\n", ip, files[ip], sizes[ip]/1024/1024}' | \
        sort -k4 -nr | head -10
    fi
}

# Main script logic
case "${1:-monitor}" in
    "monitor")
        monitor_storage
        ;;
    "cleanup")
        cleanup_old_files "${2:-30}"
        ;;
    "top-users")
        show_top_users
        ;;
    "alert-check")
        # Silent check for use in cron jobs
        if ! monitor_storage > /dev/null 2>&1; then
            # Send alert (customize this for your notification system)
            echo "ALERT: File uploader storage exceeds threshold" | mail -s "Storage Alert" admin@yoursite.com 2>/dev/null || true
        fi
        ;;
    "help"|*)
        echo "Usage: $0 [monitor|cleanup|top-users|alert-check|help]"
        echo ""
        echo "Commands:"
        echo "  monitor     - Show current storage status (default)"
        echo "  cleanup     - Remove old files (optional: specify days, default 30)"
        echo "  top-users   - Show users with highest upload usage"
        echo "  alert-check - Silent check for cron jobs"
        echo "  help        - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 monitor"
        echo "  $0 cleanup 60"
        echo "  $0 top-users"
        ;;
esac
