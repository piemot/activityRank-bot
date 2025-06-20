import {
  BulletList,
  Layout,
  ListEntry,
  Section,
  SectionBody,
  SectionHeader,
  Title,
} from '../components';

export default function Privacy() {
  return (
    <Layout>
      <Title>Privacy Policy</Title>
      <div className="content w-full max-w-3xl px-4">
        <Section>
          <SectionHeader>Overview</SectionHeader>
          <SectionBody>
            At ActivityRank, accessible from activityrank.me, one of our main priorities is the
            privacy of our visitors. This Privacy Policy document contains types of information that
            is collected and recorded by ActivityRank and how we use it. If you have additional
            questions or require more information about our Privacy Policy, do not hesitate to
            contact us. This Privacy Policy applies only to our online activities and is valid for
            visitors to our website with regards to the information that they shared and/or collect
            in ActivityRank. This policy is not applicable to any information collected offline or
            via channels other than this website and bot. Our Privacy Policy was created with the
            help of the Privacy Policy Generator and the Generate Privacy Policy Generator.
          </SectionBody>
        </Section>
        <Section>
          <SectionHeader>Consent</SectionHeader>
          <SectionBody>
            By using our website and bot, you hereby consent to our Privacy Policy and agree to its
            terms.
          </SectionBody>
        </Section>
        <Section>
          <SectionHeader>Information we collect</SectionHeader>
          <SectionBody>
            The personal information that you are asked to provide, and the reasons why you are
            asked to provide it, will be made clear to you at the point we ask you to provide your
            personal information. If you contact us directly, we may receive additional information
            about you such as your name, email address, phone number, the contents of the message
            and/or attachments you may send us, and any other information you may choose to provide.
            When you register for an Account, we may ask for your contact information, including
            items such as name, company name, address, email address, and telephone number.
          </SectionBody>
        </Section>
        <Section>
          <SectionHeader>How we use your information</SectionHeader>
          <SectionBody>
            We use the information we collect in various ways, including to:
            <BulletList>
              <ListEntry>
                Provide, operate, and maintain our webste Improve, personalize, and expand our
                website and bot.
              </ListEntry>
              <ListEntry>Understand and analyze how you use our website.</ListEntry>
              <ListEntry>Develop new products, services, features, and functionality.</ListEntry>
              <ListEntry>
                Communicate with you, either directly or through one of our partners, including for
                customer service, to provide you with updates and other information relating to the
                webste, and for marketing and promotional purposes.
              </ListEntry>
              <ListEntry>Send you emails.</ListEntry>
              <ListEntry>Find and prevent fraud.</ListEntry>
            </BulletList>
          </SectionBody>
        </Section>
        <Section>
          <SectionHeader>Log files</SectionHeader>
          <SectionBody>
            ActivityRank follows a standard procedure of using log files. These files log visitors
            when they visit website and bot. All hosting companies do this and a part of hosting
            services&apos; analytics. The information collected by log files include internet
            protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time
            stamp, referring/exit pages, and possibly the number of clicks. These are not linked to
            any information that is personally identifiable. The purpose of the information is for
            analyzing trends, administering the site, tracking users&apos; movement on website and
            bot, and gathering demographic information.
          </SectionBody>
        </Section>
        <Section>
          <SectionHeader>Cookies and Web Beacons</SectionHeader>
          <SectionBody>
            Like any other website, ActivityRank uses cookies. These cookies are used to store
            information including visitors&apos; preferences, and the pages on the website that the
            visitor accessed or visited. The information is used to optimize the users&apos;
            experience by customizing our web page content based on visitors&apos; browser type
            and/or other information.
          </SectionBody>
        </Section>
        <Section>
          <SectionHeader>CCPA Privacy Rights (Do Not Sell My Personal Information)</SectionHeader>
          <SectionBody>
            Under the CCPA, among other rights, California consumers have the right to: Request that
            a business that collects a consumer&apos;s personal data disclose the categories and
            specific pieces of personal data that a business has collected about consumers. Request
            that a business delete any personal data about the consumer that a business has
            collected. Request that a business that sells a consumer&apos;s personal data, not sell
            the consumer&apos;s personal data. If you make a request, we have one month to respond
            to you. If you would like to exercise any of these rights, please contact us.
          </SectionBody>
        </Section>
        <Section>
          <SectionHeader>GDPR Data Protection Rights</SectionHeader>
          <SectionBody>
            We would like to make sure you are fully aware of all of your data protection rights.
            Every user is entitled to the following:
            <BulletList>
              <ListEntry>
                The right to access – You have the right to request copies of your personal data. We
                may charge you a small fee for this service.
              </ListEntry>
              <ListEntry>
                The right to rectification – You have the right to request that we correct any
                information you believe is inaccurate. You also have the right to request that we
                complete the information you believe is incomplete.
              </ListEntry>
              <ListEntry>
                The right to erasure – You have the right to request that we erase your personal
                data, under certain conditions.
              </ListEntry>
              <ListEntry>
                The right to restrict processing – You have the right to request that we restrict
                the processing of your personal data, under certain conditions.
              </ListEntry>
              <ListEntry>
                The right to object to processing – You have the right to object to our processing
                of your personal data, under certain conditions.
              </ListEntry>
              <ListEntry>
                The right to data portability – You have the right to request that we transfer the
                data that we have collected to another organization, or directly to you, under
                certain conditions. If you make a request, we have one month to respond to you. If
                you would like to exercise any of these rights, please contact us.
              </ListEntry>
            </BulletList>
          </SectionBody>
        </Section>
        <Section>
          <SectionHeader>Children&apos;s information</SectionHeader>
          <SectionBody>
            Another part of our priority is adding protection for children while using the internet.
            We encourage parents and guardians to observe, participate in, and/or monitor and guide
            their online activity. ActivityRank does not knowingly collect any Personal Identifiable
            Information from children under the age of 13. If you think that your child provided
            this kind of information on our website and bot, we strongly encourage you to contact us
            immediately and we will do our best efforts to promptly remove such information from our
            records.
          </SectionBody>
        </Section>
      </div>
    </Layout>
  );
}
