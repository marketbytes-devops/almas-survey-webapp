import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import ThankYouBg from "../../assets/img-5.webp";

const ThankYou = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=AW-947966161";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;

      gtag("js", new Date());
      gtag("config", "AW-947966161");

      gtag("event", "conversion", {
        send_to: "AW-947966161/4WcNCM2IyIgbENGhg8QD",
      });

      console.log("✅ Google Ads conversion fired on Thank You page");
    };

    return () => {
      document.head.removeChild(script); 
    };
  }, []);

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${ThankYouBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Helmet>
        <title>Thank You | Moving Enquiry Submitted</title>
        <meta
          name="description"
          content="Thank you for submitting your enquiry to our moving company in Qatar. We'll get back to you soon with further details."
        />
        <link rel="canonical" href="https://www.almasintl.com/thank-you" />
      </Helmet>

      <div className="absolute inset-0 bg-gradient-to-b from-primary via-black to-black opacity-50"></div>
      <div className="text-center z-10">
        <h1 className="text-white text-4xl font-normal pb-4">
          Thanks for submitting!
        </h1>
        <p className="text-white text-lg font-light pb-2">
          Your message has been sent!
        </p>
        <div className="pt-10">
          <Link
            to="/"
            className="bg-secondary text-black rounded-2xl px-4 py-2 text-base hover:bg-white hover:text-gray-900 transition-colors duration-300 inline-block"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;

// import React from "react";
// import { Helmet } from "react-helmet";
// import { Link } from "react-router-dom";
// import ThankYouBg from "../../assets/img-5.webp";

// const ThankYou = () => {
//   return (
//     <div
//       className="relative w-full h-screen flex items-center justify-center"
//       style={{
//         backgroundImage: `url(${ThankYouBg})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       <Helmet>
//         <title>Thank You | Moving Enquiry Submitted</title>
//         <meta
//           name="description"
//           content="Thank you for submitting your enquiry to our moving company in Qatar. We'll get back to you soon with further details."
//         />
//         <link rel="canonical" href="https://www.almasintl.com/thank-you" />
//         {/* Website Form Submission conversion */}
//         <script>
//           {`
//             gtag('event', 'conversion', {'send_to': 'AW-947966161/JHuDCKju84QbENGhg8QD'});
//           `}
//         </script>
//         {/* Thank You Form conversion */}
//         <script>
//           {`
//             gtag('event', 'conversion', {'send_to': 'AW-947966161/UDuJCLngy5sZENGhg8QD'});
//           `}
//         </script>
//         {/* Get A Quote conversion */}
//         <script>
//           {`
//             gtag('event', 'conversion', {'send_to': 'AW-947966161/hxylCJ36jpIZENGhg8QD'});
//           `}
//         </script>
//         {/* Custom get_a_quote event */}
//         <script>
//           {`
//             gtag('event', 'get_a_quote', {});
//           `}
//         </script>
//       </Helmet>
//       <div className="absolute inset-0 bg-gradient-to-b from-primary via-black to-black bg-no-repeat bg-center bg-cover opacity-50"></div>
//       <div className="text-center z-10">
//         <h1 className="text-white text-4xl font-normal pb-4">
//           Thanks for submitting!
//         </h1>
//         <p className="text-white text-lg font-light pb-2">
//           Your message has been sent!
//         </p>
//         <div className="pt-10">
//           <Link
//             to="/"
//             className="bg-secondary text-black rounded-2xl px-4 py-2 text-base hover:bg-white hover:text-gray-900 transition-colors duration-300 inline-block"
//           >
//             Go Home
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ThankYou;