# Admin Dashboard - Getting Started Guide

## 🚀 Quick Start

### Access the Dashboard
1. **Log in as an admin user**
   - Navigate to `/login`
   - Enter admin account credentials
   
2. **Go to admin dashboard**
   - Navigate to `/admin/dashboard`
   - OR Simply navigate to `/admin` (automatically redirects)

### First Time Setup

#### Prerequisites
- Admin account created
- Backend API running on `http://localhost:4000` (default)
- Database populated with data

#### Configuration
Edit environment variables if needed:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000  # Backend API endpoint
```

## 📖 Using the Dashboard

### Main Tabs Overview

#### 1. Overview Tab (Home)
**What you see**: Dashboard statistics
- Total users breakdown
- Claims summary
- Policy counts
- Revenue metrics
- Approval rates

**Actions**: None (read-only, informational)

#### 2. Users Tab
**What you see**: List of all system users
- User names and emails
- Current roles
- Creation dates
- Search and filter options

**Actions you can take**:
- Search by name or email
- Filter by role
- Edit user role
- Save role changes

**Step-by-step to change a user role**:
1. Click "Users" tab
2. Search for user name or email
3. Use role filter if needed
4. Find the user in the list
5. Click the "Edit" button (pencil icon)
6. A dialog opens showing user details
7. Click the role dropdown
8. Select new role (User/Admin/Insurer)
9. Click "Update" button
10. Toast notification confirms change

#### 3. Health Claims Tab
**What you see**: All health insurance claims
- Claim numbers
- Hospital names
- Doctor names
- Claim amounts
- Current status
- Treatment dates

**Actions you can take**:
- Filter by status
- Review individual claims
- Update claim status
- Set approved amount
- Add rejection reason

**Step-by-step to approve a health claim**:
1. Click "Health Claims" tab
2. Find the claim you want to review
3. Click the "Review" button
4. In the dialog that opens:
   - Review all claim details
   - Click Status dropdown
   - Select "Approved" status
   - Enter the approved amount (can be less than claimed)
   - Leave rejection reason blank
5. Click "Update Claim"
6. Claim status changes to Approved
7. Toast shows "Health claim updated"

**Step-by-step to reject a health claim**:
1. Click "Health Claims" tab
2. Find the claim you want to review
3. Click the "Review" button
4. In the dialog:
   - Click Status dropdown
   - Select "Rejected" status
   - Approved amount field disappears
   - Rejection Reason field appears (required)
   - Type clear reason for rejection
5. Click "Update Claim"
6. Claim marked as Rejected
7. User can see rejection reason

#### 4. Insurance Claims Tab
**What you see**: All general insurance claims
- Claim numbers
- Incident locations
- Incident dates
- Damage descriptions
- Estimated costs
- Current status

**Actions you can take**: (Same as Health Claims)
- Filter by status
- Review individual claims
- Update claim status
- Set approved amount
- Add rejection reason

**Same workflow as Health Claims for approval/rejection**

#### 5. Health Policies Tab
**What you see**: Table of all health insurance policies
- Policy numbers
- Policyholder names
- Coverage amounts
- Monthly premiums
- Status (Active/Inactive/Expired)
- Expiration dates

**Actions you can take**: None (read-only monitoring)

**Use for**: Verifying policies when reviewing claims

#### 6. Insurance Policies Tab
**What you see**: Table of all general insurance policies
- Policy numbers
- Coverage amounts
- Annual premiums
- Status
- Expiration dates

**Actions you can take**: None (read-only monitoring)

**Use for**: Verifying policies when reviewing claims

## 📊 Understanding the Statistics

On the Overview tab, you'll see these metrics:

**Total Users**: 50
- Includes 3 admins and 5 insurers

**Health Claims**: 23 (5 pending)
- 23 total submitted
- 5 awaiting review or initial submission

**Insurance Claims**: 18 (3 pending)
- 18 total submitted
- 3 awaiting action

**Total Policies**: 41
- 30 health policies + 11 insurance policies

**Approved Value**: $45,230.50
- Total amount paid out for approved claims

**Health Revenue**: $127,500
- Monthly premium × 12 months forecast

**Insurance Revenue**: $89,200
- Monthly premium × 12 months forecast

**Approval Rate**: 78%
- 78% of all submitted claims approved
- 22% rejected or pending

## 🔄 Common Workflows

### Workflow 1: Reviewing New Claims

```
1. Check Overview → See "5 pending" for health or insurance
2. Click appropriate Claims tab
3. Filter by "Submitted" status
4. Review each claim:
   - Read all details
   - Click Review button
   - Change status to "Under Review"
   - Click Update
5. Come back to fully review:
   - Click claim Review again
   - Change to "Approved" or "Rejected"
   - Add details (amount or reason)
   - Click Update
```

### Workflow 2: Daily Management

```
1. Log in to admin dashboard
2. Check Overview statistics
3. Note pending workload
4. Go to Health Claims tab
5. Filter by "Under Review"
6. Finalize reviews (approve/reject)
7. Go to Insurance Claims tab
8. Repeat for insurance
9. Check policies for upcoming expirations
10. Log out when done
```

### Workflow 3: User Management

```
1. New user signs up as "User"
2. They apply for insurer status
3. Admin receives notification
4. Go to Users tab
5. Search for their name
6. Click Edit
7. Change role to "Insurer"
8. Click Update
9. User now has insurer capabilities
```

## 🔍 How to Find Specific Information

### Finding a specific claim:
1. Go to appropriate Claims tab (Health or Insurance)
2. Use filters:
   - Filter by status you remember
   - Scroll through the cards
   - OR search if search available (team can add this)

### Finding a specific user:
1. Go to Users tab
2. Type name or email in search box
3. Results filter in real-time
4. Or use role filter to narrow down

### Finding policy details:
1. Go to Health Policies or Insurance Policies tab
2. Scroll through the table
3. Look for policy number or holder name

## ⚙️ Settings & Preferences

Currently, settings are per-session:
- Filters reset when you reload
- Tabs stay selected during session
- Data refreshes when clicking tabs

Future enhancements could include:
- Save filter preferences
- Remember last viewed tab
- Custom dashboard layouts
- Export reports to PDF/Excel

## 🆘 Troubleshooting

### Problem: Can't access dashboard
**Solution**:
- Check if logged in as admin
- Admin role required, not just any user
- Try `/admin` instead of `/admin/dashboard`
- Clear browser cookies and login again

### Problem: Data not loading
**Solution**:
- Check if backend API is running
- Verify API URL in environment variables
- Try refreshing the page
- Check browser console for errors

### Problem: Can't update a claim
**Solution**:
- Ensure all required fields filled
- For approved: must have amount
- For rejected: must have reason
- Check if any fields are showing as required (red asterisk)

### Problem: Statistics look wrong
**Solution**:
- Refresh page to reload data
- Check if new claims were added
- Statistics calculate from database in real-time

### Problem: User role update failed
**Solution**:
- Ensure you have admin access
- Try the user role edit again
- Check error message in toast notification

## 📱 Mobile Usage

The dashboard is responsive and works on mobile:
- Tabs stack vertically on small screens
- Tables scroll horizontally if needed
- Dialogs adapt to mobile size
- Touch-friendly button sizes

## 🔐 Security Tips

- **Never share your admin login**
- **Always logout when done**
- **Don't leave admin panel unattended**
- **Report suspicious activity**
- **Change password regularly**

## 📞 Need Help?

### Reference Materials
1. Read `ADMIN_DASHBOARD_GUIDE.md` for detailed information
2. Check `ADMIN_QUICK_REFERENCE.md` for quick answers
3. Review `ADMIN_DASHBOARD_FEATURES.md` for feature overview

### Getting Support
- Report bugs to development team
- Ask questions in team chat
- Check existing documentation first
- Document issues with screenshots

## ✨ Tips for Efficient Use

1. **Start with Overview**: Check statistics first to know what needs attention
2. **Use Filters**: Filter claims by status to focus on pending work
3. **Review Systematically**: Go through "Submitted" status first, then "Under Review"
4. **Be Consistent**: Use standard rejection reasons for consistency
5. **Track Changes**: Note reviewer names and dates for audit
6. **Monitor Regularly**: Check dashboard at start of work day
7. **Update Policies**: Review policy tab for upcoming expirations

## 🎯 Next Steps

1. ✅ Log in with admin account
2. ✅ Navigate to `/admin/dashboard`
3. ✅ Explore the Overview tab
4. ✅ Try editing a user role
5. ✅ Review a test claim
6. ✅ Explore all tabs
7. ✅ Read the full documentation
8. ✅ Start using for real admin tasks

---

**Dashboard Location**: `/admin/dashboard`  
**Required Role**: Admin  
**Documentation**: See other .md files in repository  
**Version**: 1.0 | **Release Date**: November 2025
