# Admin Dashboard Documentation

## Overview
The new comprehensive Admin Dashboard is a complete management system for the IWAS (Insurance Workflow Automation System). It provides administrators with full control over users, policies, and claim approvals.

## Features

### 1. **Dashboard Overview Tab**
- **Real-time Statistics**: View key metrics at a glance
  - Total Users (with breakdown of admins and insurers)
  - Health Insurance Claims (with pending count)
  - General Insurance Claims (with pending count)
  - Total Active Policies (health and general)
  - Total Approved Claims Value
  - Revenue Metrics (annual premium calculations)
  - Overall Approval Rate

### 2. **User Management Tab**
- **View All Users**: Display all system users with their details
- **Search Functionality**: Search users by name or email
- **Role Filtering**: Filter users by role (User, Admin, Insurer)
- **Role Management**: Change user roles directly from the interface
  - Promote users to Admin or Insurer roles
  - Demote users back to regular User role
- **User Details**: View user creation date and current role

### 3. **Health Insurance Claims Tab**
- **Claim Listing**: View all health insurance claims
- **Status Filtering**: Filter claims by status:
  - Submitted
  - Under Review
  - Approved
  - Rejected
  - Paid
- **Claim Details**: See claim information including:
  - Claim Number
  - Hospital Name
  - Doctor Name
  - Diagnosis
  - Claim Amount
  - Treatment Date
- **Claim Review Dialog**: 
  - Update claim status
  - Set approved amount
  - Add rejection reason
  - Track reviewed by and review date

### 4. **General Insurance Claims Tab**
- **Claim Listing**: View all general insurance claims
- **Status Filtering**: Filter claims by status
- **Claim Details**: See claim information including:
  - Claim Number
  - Incident Location
  - Incident Date
  - Incident Description
  - Damage Description
  - Estimated Cost
- **Claim Review Dialog**: 
  - Update claim status
  - Set approved amount
  - Add rejection reason

### 5. **Health Insurance Policies Tab**
- **Policy Overview**: View all health insurance policies
- **Policy Information**: See details including:
  - Policy Number
  - Policyholder Name
  - Coverage Amount
  - Monthly Premium
  - Status (Active/Inactive/Expired)
  - Expiration Date

### 6. **General Insurance Policies Tab**
- **Policy Overview**: View all general insurance policies
- **Policy Information**: See details including:
  - Policy Number
  - Coverage Amount
  - Annual Premium
  - Status
  - Expiration Date

## How to Use

### User Management
1. Navigate to "Users" tab
2. Use the search bar to find specific users
3. Use the role filter dropdown to filter by role
4. Click "Edit" button on any user to open the edit dialog
5. Select a new role from the dropdown
6. Click "Update" to save changes

### Processing Health Claims
1. Go to "Health Claims" tab
2. Filter by status if needed (e.g., "Submitted", "Under Review")
3. Review claim details displayed in the cards
4. Click the "Review" button to open the review dialog
5. Select a new status:
   - **Submitted**: Initial submission state
   - **Under Review**: Being reviewed by admin
   - **Approved**: Approved by admin (requires amount)
   - **Rejected**: Denied by admin (requires reason)
   - **Paid**: Payment processed
6. For approved claims, enter the approved amount
7. For rejected claims, enter the rejection reason
8. Click "Update Claim" to save changes

### Processing General Insurance Claims
1. Go to "Insurance Claims" tab
2. Filter by status if needed
3. Review claim details displayed in the cards
4. Click the "Review" button to open the review dialog
5. Follow the same process as health claims
6. Click "Update Claim" to save changes

### Monitoring Policies
1. Go to "Health Policies" or "Insurance Policies" tabs
2. View all policies with their details
3. Check status, coverage amounts, and expiration dates
4. Use policy information for claim verification

## Key Workflows

### Claim Approval Workflow
1. User submits a claim (automatically in "Submitted" status)
2. Admin reviews the claim details
3. Admin changes status to "Under Review"
4. Admin reviews documents and information
5. Admin either:
   - **Approves**: Set status to "Approved", enter approved amount
   - **Rejects**: Set status to "Rejected", enter rejection reason
6. Once approved, finance team marks as "Paid" after processing payment

### User Role Management Workflow
1. New users register as "User" by default
2. Admin reviews user applications/profile
3. Admin can promote to "Insurer" role if they represent an insurance company
4. Admin can promote to "Admin" role if they need administrative access
5. Roles can be demoted as needed

## Approval Criteria (Guidelines for Admins)

### Health Claims Approval
- Check if policy is active and covers the treatment
- Verify treatment date is within policy period
- Review hospital and doctor details for legitimacy
- Check claim amount is within policy limits
- Review submitted documents (medical bills, prescriptions, etc.)
- Check for any fraudulent indicators
- Ensure patient hasn't exceeded annual limits

### General Insurance Claims Approval
- Verify incident date is within policy period
- Check incident location and details
- Review incident description for accuracy
- Assess estimated repair costs
- Check for policy exclusions
- Review provided photos and documentation
- Check claim doesn't exceed coverage limits

## Statistics Explained

- **Total Users**: Count of all registered users
- **Total Admins**: Count of users with admin role
- **Total Insurers**: Count of users with insurer role
- **Health Claims**: Count of all health insurance claims submitted
- **Insurance Claims**: Count of all general insurance claims submitted
- **Pending Claims**: Claims in "Submitted" or "Under Review" status
- **Approved Claims**: Claims in "Approved" or "Paid" status
- **Total Policies**: All active policies across both insurance types
- **Annual Premium Revenue**: Monthly premium × 12 for forecasting
- **Approved Claims Value**: Total amount approved and paid out
- **Approval Rate**: Percentage of claims approved vs. total submitted

## Best Practices

1. **Review Regularly**: Check "Under Review" claims daily
2. **Document Decisions**: Add notes when rejecting claims
3. **Verify Authenticity**: Cross-check hospital/doctor details
4. **Follow Policy Terms**: Always adhere to policy coverage limits
5. **Communicate Clearly**: Provide clear rejection reasons to users
6. **Track Metrics**: Monitor approval rates for quality control
7. **Timely Processing**: Aim to review claims within 24-48 hours
8. **Role Assignments**: Only assign admin role to trusted users

## API Endpoints Used

The dashboard integrates with the following API endpoints:

### Users
- `GET /api/admin/users` - Fetch all users
- `PATCH /api/admin/users/:userId/role` - Update user role

### Health Claims
- `GET /api/health/claims` - Fetch all health claims
- `PATCH /api/health/claims/:claimId` - Update health claim status

### Insurance Claims
- `GET /api/claims/all` - Fetch all insurance claims
- `PATCH /api/claims/:claimId` - Update insurance claim status

### Health Policies
- `GET /api/health/policies` - Fetch all health policies

### Insurance Policies
- `GET /api/insurance/policies` - Fetch all insurance policies

## Technical Details

- **Frontend Framework**: Next.js with React
- **UI Components**: Custom component library with Tailwind CSS
- **State Management**: React hooks (useState, useContext)
- **Authentication**: Protected Route component checks admin access
- **Data Fetching**: Async/await with error handling
- **Notifications**: Toast notifications for user feedback

## Security Considerations

1. Only admins can access this dashboard
2. All API calls include authentication headers
3. User role changes are logged (reviewer ID and timestamp)
4. Claim reviews are tracked with admin ID and timestamp
5. Sensitive data is only shown to authorized admins

## Future Enhancements

- Bulk claim processing
- Advanced analytics and reporting
- Batch user uploads
- Export reports to PDF/Excel
- Email notifications for pending approvals
- Audit logs for all admin actions
- Policy template management
- Premium calculation adjustments
- Fraud detection system integration
