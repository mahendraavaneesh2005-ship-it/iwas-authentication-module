# Admin Dashboard Quick Reference Card

## Accessing Admin Dashboard
- **URL**: `/admin` or `/admin/dashboard`
- **Required Role**: Admin only
- **Authentication**: Must be logged in

## Main Tabs

| Tab | Purpose | Key Actions |
|-----|---------|------------|
| **Overview** | Dashboard stats | View metrics, no actions |
| **Users** | Manage users | Search, filter, edit roles |
| **Health Claims** | Health insurance claims | Review, approve/reject |
| **Insurance Claims** | General insurance claims | Review, approve/reject |
| **Health Policies** | View health policies | Monitor coverage & dates |
| **Insurance Policies** | View insurance policies | Monitor coverage & dates |

## Overview Dashboard Stats

1. **Total Users**: All registered users
2. **Health Claims**: Total health claims submitted
3. **Insurance Claims**: Total general insurance claims
4. **Total Policies**: All active policies
5. **Approved Value**: Total paid out ($)
6. **Health Revenue**: Annual premium forecast
7. **Insurance Revenue**: Annual premium forecast
8. **Approval Rate**: % of claims approved

## User Management Workflow

### Find a User
```
1. Click "Users" tab
2. Use search bar (name/email) or role filter
3. Click "Edit" button
```

### Change User Role
```
1. Search for user
2. Click "Edit" 
3. Select new role:
   - User: Regular customer
   - Insurer: Insurance company representative
   - Admin: Full admin access
4. Click "Update"
```

## Claim Review Workflow

### For Health Claims
```
1. Click "Health Claims" tab
2. Filter by status if needed
3. Read claim details:
   - Hospital & Doctor info
   - Diagnosis & Treatment
   - Claim amount
4. Click "Review" button
5. Select status:
   - Submitted → Under Review
   - Under Review → Approved/Rejected
   - Approved → Paid
6. If approving: Enter approved amount
7. If rejecting: Enter rejection reason
8. Click "Update Claim"
```

### For Insurance Claims
```
1. Click "Insurance Claims" tab
2. Filter by status if needed
3. Read claim details:
   - Location & Date
   - Description of incident
   - Damage details
   - Estimated cost
4. Click "Review" button
5. Follow same status workflow
6. If approving: Enter approved amount
7. If rejecting: Enter rejection reason
8. Click "Update Claim"
```

## Status Workflow

### Standard Claim Status Flow
```
Submitted → Under Review → Approved → Paid
                         ├→ Rejected → (End)
                         └→ Paid
```

### Status Meanings
- **Submitted**: Just received, awaiting review
- **Under Review**: Being examined by admin
- **Approved**: Verified and approved, ready for payment
- **Rejected**: Denied due to policy terms or issues
- **Paid**: Payment has been processed

## Quick Filters

### Users Tab
- **Role Filter**: User | Admin | Insurer | All
- **Search**: By name or email

### Claims Tabs
- **Status Filter**: 
  - Submitted
  - Under Review
  - Approved
  - Rejected
  - Paid
  - All

## Common Actions

### Approve a Claim
1. Click Review button on claim
2. Change status to "Approved"
3. Enter approved amount (can be less than claimed)
4. Click "Update Claim"
✅ Claim now pending payment processing

### Reject a Claim
1. Click Review button on claim
2. Change status to "Rejected"
3. Enter detailed rejection reason
4. Click "Update Claim"
📧 Rejection reason visible to user

### Mark as Paid
1. Click Review button on claim
2. Change status to "Paid"
3. Click "Update Claim"
✅ Claim marked as completed

### Promote User to Insurer
1. Search user in Users tab
2. Click Edit
3. Select "Insurer" role
4. Click "Update"
✅ User can now represent insurance company

### Promote User to Admin
1. Search user in Users tab
2. Click Edit
3. Select "Admin" role
4. Click "Update"
⚠️ Use with caution - admin has full system access

## Statistics Breakdown

### Claims Pending
- Under "Submitted" or "Under Review" status
- **Action Needed**: Review and approve/reject

### Claims Approved
- Under "Approved" or "Paid" status
- **Action Needed**: Finance team processes payment

### Approval Rate
```
Formula: (Approved Claims / Total Claims) × 100
Example: 80 approved / 100 total = 80% approval rate
```

### Revenue Metrics
```
Formula: Monthly Premium × 12
Shows annual forecasted revenue from active policies
```

## Keyboard Shortcuts & Quick Tips

| Action | Method |
|--------|--------|
| Search Users | Click search bar in Users tab |
| Filter Claims | Click Filter dropdown in Claims tabs |
| Edit User | Click blue Edit button |
| Review Claim | Click Review button in claim card |
| Save Changes | Click Update button in dialog |
| Cancel Dialog | Click Cancel or close with X |
| Clear Filters | Select "All" in filter dropdown |

## Common Rejection Reasons

- **Policy Not Active**: Policy expired or cancelled
- **Outside Coverage**: Treatment/incident not covered
- **Exceeded Limits**: Claim amount exceeds policy limit
- **Missing Documentation**: Required documents not submitted
- **Duplicate Claim**: Claim already filed for same incident
- **Policy Exclusion**: Service explicitly excluded
- **Claim Timing**: Outside policy effective dates
- **Fraudulent Activity**: Suspected fraud indicators

## Best Practices

✅ **DO**
- Review claims within 24 hours
- Check policy details before approving
- Provide clear rejection reasons
- Keep approval rates above 60%
- Monitor pending workload daily
- Update status regularly

❌ **DON'T**
- Approve without reviewing details
- Approve amounts exceeding policy limits
- Give admin role to untrusted users
- Leave claims in "Under Review" indefinitely
- Approve fraudulent claims
- Delete or ignore rejected claims

## Troubleshooting

### Can't see claims?
- Check you're logged in as Admin
- Ensure correct tab is selected
- Try refreshing the page

### Can't edit user?
- Verify user exists
- Check admin permissions
- Try clearing browser cache

### Update button disabled?
- Fill all required fields
- Check network connection
- Refresh and try again

### Statistics look wrong?
- Refresh page to reload data
- Check if claims were recently added
- Data updates in real-time

## Support & Documentation

- **Full Guide**: See `ADMIN_DASHBOARD_GUIDE.md`
- **Features List**: See `ADMIN_DASHBOARD_FEATURES.md`
- **API Docs**: Check backend documentation
- **Issues**: Contact system administrator

## Security Reminders

🔒 **Remember**
- Only share admin credentials with trusted users
- Admin can see all user and claim data
- All actions are tracked and logged
- Regular passwords should be strong
- Never share login credentials
- Logout when done
- Report suspicious activity

---
**Version**: 1.0 | **Updated**: November 2025
