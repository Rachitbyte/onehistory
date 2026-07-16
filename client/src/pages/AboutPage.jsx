import React from 'react';

const AboutPage = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '1rem',
                    letterSpacing: '-0.02em'
                }}>
                    About OneHistory
                </h1>
                <p style={{
                    fontSize: '1.125rem',
                    color: 'var(--text-muted)',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: '1.6'
                }}>
                    A unified, secure platform for your complete medical history.
                </p>
            </div>

            {/* Main Content Container */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid var(--glass-border)',
                padding: '3rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>

                {/* Section 1: The Product */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        marginBottom: '1rem'
                    }}>
                        What is OneHistory?
                    </h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        lineHeight: '1.7',
                        fontSize: '1rem'
                    }}>
                        OneHistory is a digital health record aggregation system designed to consolidate disparate medical data into a single, accessible timeline. It connects with labs, clinics, and hospitals to provide a comprehensive view of a patient's health journey, eliminating the need for fragmented physical records.
                    </p>
                </section>

                {/* Section 2: The Problem */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        marginBottom: '1rem'
                    }}>
                        The Problem We Solve
                    </h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        lineHeight: '1.7',
                        fontSize: '1rem'
                    }}>
                        Healthcare data is often siloed across multiple providers. Patients frequently struggle to recall their full medical history or provide accurate documentation during visits. Doctors lose valuable time gathering historical data, which can delay diagnosis and treatment. OneHistory bridges this gap by ensuring data portability and immediate access.
                    </p>
                </section>

                {/* Section 3: How It Works */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        marginBottom: '1rem'
                    }}>
                        How It Works
                    </h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        lineHeight: '1.7',
                        fontSize: '1rem'
                    }}>
                        We serve as a secure intermediary layer. Patients authorize providers to upload records directly to their OneHistory case file. This creates a chronological, immutable ledger of visits, lab results, and prescriptions. Access is strictly controlled by the patient, who can grant temporary viewing rights to new specialists or emergency responders.
                    </p>
                </section>

                {/* Section 4: Responsibility */}
                <section>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        marginBottom: '1rem'
                    }}>
                        Data Responsibility
                    </h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        lineHeight: '1.7',
                        fontSize: '1rem'
                    }}>
                        We prioritize data privacy and security above all else. Our infrastructure is built to adhere to <strong>HIPAA and GDPR principles</strong>, ensuring that sensitive health information is encrypted both in transit and at rest. We do not sell patient data. Our business model is based on SaaS subscriptions for providers and premium storage features for patients.
                    </p>
                </section>

            </div>

            <div style={{
                marginTop: '3rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--text-muted)'
            }}>
                © {new Date().getFullYear()} OneHistory.
            </div>
        </div>
    );
};

export default AboutPage;
