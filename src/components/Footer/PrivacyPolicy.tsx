import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: "860px" }}>
      <button
        className="btn btn-sm mb-4"
        style={{ backgroundColor: "#198754", color: "#fff" }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h2 className="fw-bold mb-4 text-success">Privacy Policy</h2>
      <p>
        Book Your Turf is committed to protecting your privacy and ensuring that
        your personal information is handled in a safe and responsible manner.
        This Privacy Policy explains how we collect, use, disclose, and
        safeguard your information when you use the Book Your Turf mobile
        application and related services.
      </p>
      <p>
        By using our application, you agree to the collection and use of
        information in accordance with this policy.
      </p>
      <p>
        <li><strong>Information We Collect</strong></li>
        &nbsp;&nbsp;&nbsp;We may collect the following types of information:
      </p>
      <p>
        a. Personal Information
        <br />
        &nbsp;&nbsp;&nbsp;o Full Name
        <br />
        &nbsp;&nbsp;&nbsp;o Email Address
        <br />
        &nbsp;&nbsp;&nbsp;o Phone Number
        <br />
        &nbsp;&nbsp;&nbsp;o Profile details (if provided)
        <br />
      </p>
      <p>
        b. Booking & Transaction Data
        <br />
        &nbsp;&nbsp;&nbsp;o Turf bookings and schedules
        <br />
        &nbsp;&nbsp;&nbsp;o Payment details (processed via secure third-party payment gateways)
        <br />
        &nbsp;&nbsp;&nbsp;o Transaction history
        <br />
      </p>
      <p>
        c. Location Data
        <br />
        &nbsp;&nbsp;&nbsp;o Approximate or precise location (to show nearby turfs and venues)
        <br />
      </p>
      <p>
        d. Device & Usage Information
        <br />
        &nbsp;&nbsp;&nbsp;o Device type, operating system
        <br />
        &nbsp;&nbsp;&nbsp;o App usage statistics
        <br />
        &nbsp;&nbsp;&nbsp;o Log data (IP address, access times, etc.)
        <br />
      </p>
      <p>
        e. Optional Information
        <br />
        &nbsp;&nbsp;&nbsp;o Preferences, interests, and feedback
        <br />
        &nbsp;&nbsp;&nbsp;o Responses to surveys or promotional offers
        <br />
      </p>
      <p>
        <li><strong>How We Use Your Information</strong></li>
        We use the collected information for the following purposes:
      </p>
      <p>
        &nbsp;&nbsp;&nbsp;o To provide and maintain our services
        <br />
        &nbsp;&nbsp;&nbsp;o To process bookings and payments securely
        <br />
        &nbsp;&nbsp;&nbsp;o To display nearby sports venues and availability
        <br />
        &nbsp;&nbsp;&nbsp;o To send booking confirmations and reminders
        <br />
        &nbsp;&nbsp;&nbsp;o To improve app functionality and user experience
        <br />
        &nbsp;&nbsp;&nbsp;o To provide customer support
        <br />
        &nbsp;&nbsp;&nbsp;o To send updates, offers, and promotional notifications (only with
        consent)
        <br />
        &nbsp;&nbsp;&nbsp;o To prevent fraud and ensure platform security
        <br />
      </p>
      <p>
        <li><strong>Payment Information</strong></li>
        We support secure payment methods including:
      </p>
      <p>
        &nbsp;&nbsp;&nbsp;o Google Pay (GPay)
        <br />
        &nbsp;&nbsp;&nbsp;o PhonePe
        <br />
        &nbsp;&nbsp;&nbsp;o UPI Payments
        <br />
        &nbsp;&nbsp;&nbsp;o Debit/Credit Cards
        <br />
        &nbsp;&nbsp;&nbsp;o Netbanking
        <br />
      </p>
      <p>
        Note: We do not store your sensitive payment details. All transactions
        are processed securely through trusted third-party payment gateways.
      </p>
      <p>
        <li><strong>Data Sharing and Disclosure</strong></li>
        We do not sell, rent, or trade your personal information.
      </p>
      <p>We may share your information only in the following cases:</p>
      <p>
        &nbsp;&nbsp;&nbsp;o With turf owners (only necessary booking details)
        <br />
        &nbsp;&nbsp;&nbsp;o With trusted service providers (payment gateways, notification
        services)
        <br />
        &nbsp;&nbsp;&nbsp;o To comply with legal obligations or government requests
        <br />
        &nbsp;&nbsp;&nbsp;o To protect our rights, users, and platform security
        <br />
      </p>
      <p>
       <li><strong>Data Security</strong></li>
        We are committed to ensuring that your information is secure. <br />
        We implement:
      </p>
      <p>
        &nbsp;&nbsp;&nbsp;o Encryption and secure communication protocols
        <br />
        &nbsp;&nbsp;&nbsp;o Restricted data access controls
        <br />
        &nbsp;&nbsp;&nbsp;o Regular system monitoring
        <br />
      </p>
      <p>However, no digital platform can guarantee 100% security.</p>
      <p>
        <li><strong>Cookies and Session Technologies</strong></li>
        Book Your Turf may use cookies or similar technologies to:
      </p>
      <p>
        &nbsp;&nbsp;&nbsp;o Analyze app usage and performance
        <br />
        &nbsp;&nbsp;&nbsp;o Improve user experience
        <br />
        &nbsp;&nbsp;&nbsp;o Remember preferences
        <br />
      </p>
      <p>You can control cookie preferences through your device settings.</p>
      <p>
        Our app may contain links to third-party websites or services. Once you
        leave our app, we are not responsible for the privacy practices of those
        platforms. We recommend reviewing their privacy policies.
      </p>
      <p>
        <li><strong>User Rights & Control</strong></li>
        You have the right to:
      </p>
      <p>
        &nbsp;&nbsp;&nbsp;o Access your personal data
        <br />
        &nbsp;&nbsp;&nbsp;o Update or correct your information
        <br />
        &nbsp;&nbsp;&nbsp;o Opt out of marketing communications
        <br />
        &nbsp;&nbsp;&nbsp;o User can directly delete their account
        <br />
      </p>
      <p>
        <li><strong>Data Retention</strong></li>
        We retain your data only as long as necessary for:
      </p>
      <p>
        &nbsp;&nbsp;&nbsp;o Providing services
        <br />
        &nbsp;&nbsp;&nbsp;o Legal compliance
        <br />
        &nbsp;&nbsp;&nbsp;o Dispute resolution
        <br />
      </p>
      <p>Once no longer required, your data will be securely deleted.</p>
      <p>
        <li><strong>Children’s Privacy</strong></li>
        Book Your Turf is not intended for users under the age of 13. We do not
        knowingly collect data from children.
      </p>
      <p>
        <li><strong>Changes to This Privacy Policy</strong></li>
        We may update this Privacy Policy from time to time. Changes will be
        posted within the app, and users are encouraged to review it
        periodically.
      </p>
      <p>
        <li><strong>Contact Us</strong></li>
        If you have any questions or concerns about this Privacy Policy, you can
        contact us at:
      </p>
      <p>
        &nbsp;&nbsp;&nbsp;<strong>Email:</strong> nottaminfotech@gmail.com
        <br />
        &nbsp;&nbsp;&nbsp;<strong>Company Name:</strong> Book Your Turf
      </p>
    </div>
  );
};

export default PrivacyPolicy;
