import { db } from '@/db';
import { healthPlans } from '@/db/schema';

async function main() {
    const sampleHealthPlans = [
        {
            name: 'Basic Health Plan',
            description: 'Essential coverage for individuals seeking affordable healthcare protection with basic medical services.',
            coverageAmount: 10000,
            monthlyPremiumBase: 299,
            features: ['Outpatient Care', 'Prescription Drugs', 'Emergency Services', 'Lab Tests'],
            deductible: 1000,
            copayPercentage: 20,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Standard Health Plan',
            description: 'Comprehensive coverage with enhanced benefits including specialist care and preventive services for growing families.',
            coverageAmount: 50000,
            monthlyPremiumBase: 499,
            features: ['All Basic Features', 'Specialist Visits', 'Preventive Care', 'Maternity Care', 'Mental Health Services'],
            deductible: 500,
            copayPercentage: 15,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Premium Health Plan',
            description: 'Ultimate healthcare protection with maximum coverage, lowest copays, and access to premium services including dental and vision.',
            coverageAmount: 100000,
            monthlyPremiumBase: 799,
            features: ['All Standard Features', 'Dental Care', 'Vision Care', 'Alternative Medicine', 'International Coverage'],
            deductible: 250,
            copayPercentage: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(healthPlans).values(sampleHealthPlans);
    
    console.log('✅ Health plans seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});