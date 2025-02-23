import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Open Sans',
    src: '/fonts/arial_narrow_7.ttf'
});

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Open Sans',
        backgroundColor: '#ffffff',
        fontSize: 1,
        padding: 22,
    },
    section: {
        marginBottom: 12,
    },
    sectionItem: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'extrabold',
        marginBottom: 6,
    },
    subJobCompany: {
        fontSize: 12,
        fontWeight: 'semibold',
        marginBottom: 10
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6,
        marginTop: 6
    },
    content: {
        fontSize: 12,
        fontWeight: 'semibold',
        marginBottom: 4
    },
    itemTitle: {
        fontWeight: 'bold',
    },
    dateRange: {
        fontSize: 10,
        marginLeft: 'auto',
    },
    bulletPoint: {
        fontSize: 12,
        marginRight: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    row_between: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 1,
    },
    container_80: {
        maxWidth: '80%',
        fontWeight: 'bold',
    },
    contactInfo: {
        fontSize: 12,
        marginBottom: 18,
    },
    name: {
        fontSize: 24,
        fontWeight: 'black',
        marginBottom: 6,
    },
    underline: {
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        marginVertical: 5,
    },
    card: {
        border: '1px solid #000',
        borderRadius: 12,
        padding: 10,
        marginTop: 24,
    },
});


const ContactInfo = ({ contact }: any) => (
    <View style={styles.contactInfo}>
        <Text style={styles.name}>{contact.full_name}</Text>
        <Text>{contact.email_address} | {contact.phone_number} | {contact.address} | {contact.website}</Text>
    </View>
);

const ExperienceItem = ({ item }: any) => (
    <View style={styles.sectionItem}>
        <Text style={styles.subSectionTitle}>{item.job_title}, {item.company_name}</Text>
        <Text style={styles.subJobCompany}>{item.dates_of_employment}</Text>
        <Text style={styles.subJobCompany}>{item.company_address}</Text>
        <Text style={styles.content}>{item.job_description}</Text>
    </View>
);

const Experience = ({ experiences }: any) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <View style={styles.underline} />
        {experiences.map((item: any, index: any) => (
            <ExperienceItem key={index} item={item} />
        ))}
    </View>
);

const EducationItem = ({ item }: any) => (
    <View style={styles.sectionItem}>
        <View style={styles.row_between}>
            <Text style={styles.subSectionTitle}>{item.institution_name}</Text>
            <Text style={styles.subJobCompany}>{item.dates_attended}</Text>
        </View>
        <Text style={styles.subJobCompany}>{item.degree} | GPA: {item.gpa}</Text>
    </View>
);

const Education = ({ education }: any) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        <View style={styles.underline} />
        {education.map((item: any, index: any) => (
            <EducationItem key={index} item={item} />
        ))}
    </View>
);

const Skills = ({ skills }: any) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.underline} />
            <Text style={styles.subSectionTitle}>Technical Skills:</Text>
            <Text style={styles.content}>{skills.technical_skills}</Text>
            <Text style={styles.subSectionTitle}>Soft Skills:</Text>
            <Text style={styles.content}>{skills.soft_skills}</Text>
        </View>
    );
};

const CertificationItem = ({ item }: any) => (
    <View style={styles.sectionItem}>
        <Text style={styles.subSectionTitle}>{item.name}</Text>
        <Text style={styles.subJobCompany}>{item.date}</Text>
        <Text style={styles.subJobCompany}>{item.institution}</Text>
    </View>
);

const Certification = ({ certification }: any) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certification</Text>
        <View style={styles.underline} />
        {certification.map((item: any, index: any) => (
            <CertificationItem key={index} item={item} />
        ))}
    </View>
);

const Activities = ({ activities }: any) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activities and Interests</Text>
        <View style={styles.underline} />
        <Text style={styles.content}>{activities}</Text>
    </View>
);

const ProjectsItem = ({ item }: any) => (
    <View style={styles.sectionItem}>
        <Text style={styles.subSectionTitle}>{item.name}</Text>
        <Text style={styles.subJobCompany}>{item.description}</Text>
    </View>
);

const Projects = ({ projects }: any) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        <View style={styles.underline} />
        {projects.map((item: any, index: any) => (
            <ProjectsItem key={index} item={item} />
        ))}
    </View>
);

const Summary = ({ summary }: any) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.underline} />
        <Text style={styles.subJobCompany}>{summary}</Text>
    </View>
);

const Resume = ({ data }: any) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {data.personal_information && <ContactInfo contact={data.personal_information} />}
                {data.professional_summary && <Summary summary={data.professional_summary} />}
                {data.work_experience && <Experience experiences={data.work_experience} />}
                {data.education && <Education education={data.education} />}
                {data.skills && <Skills skills={data.skills} />}
                {data.awards_certifications && <Certification certification={data.awards_certifications} />}
                {data.activities_interests && <Activities activities={data.activities_interests} />}
                {data.projects && <Projects projects={data.projects} />}
                <View style={styles.card}>
                    <Text style={styles.subJobCompany}>Please Note: This AI-generated CV is a starting point. Carefully evaluate its suitability for each application. Enhance your CV with a CV builder to create a visually appealing and impactful document. We hope you achieve your career goals!</Text>
                </View>
            </Page>
        </Document>
    );
};

export default Resume;