import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const claims = sqliteTable('claims', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  policyId: text('policy_id').notNull(),
  claimNumber: text('claim_number').notNull().unique(),
  incidentDate: text('incident_date').notNull(),
  incidentDescription: text('incident_description').notNull(),
  incidentLocation: text('incident_location').notNull(),
  damageDescription: text('damage_description').notNull(),
  estimatedCost: real('estimated_cost').notNull(),
  documents: text('documents', { mode: 'json' }),
  photos: text('photos', { mode: 'json' }),
  status: text('status').notNull().default('submitted'),
  submittedAt: text('submitted_at').notNull(),
  reviewedAt: text('reviewed_at'),
  reviewedBy: text('reviewed_by'),
  approvedAmount: real('approved_amount'),
  rejectionReason: text('rejection_reason'),
  adminNotes: text('admin_notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});