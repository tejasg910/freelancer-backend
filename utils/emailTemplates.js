const emailVerificationTemplate = (otp, email, companyName) => {
  const template = `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Static Template</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #ffffff;
      font-size: 14px;
    "
  >
    <div
      style="
        max-width: 680px;
        margin: 0 auto;
        padding: 45px 30px 60px;
        background: #f4f7ff;
        background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
        background-repeat: no-repeat;
        background-size: 800px 452px;
        background-position: top center;
        font-size: 14px;
        color: #434343;
      "
    >
      <main>
        <div
          style="
            margin: 0;
            margin-top: 70px;
            padding: 92px 30px 115px;
            background: #ffffff;
            border-radius: 30px;
            text-align: center;
          "
        >
          <div style="width: 100%; max-width: 489px; margin: 0 auto">
            <h1
              style="
                margin: 0;
                font-size: 24px;
                font-weight: 500;
                color: #1f1f1f;
              "
            >
              Your OTP
            </h1>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-size: 16px;
                font-weight: 500;
              "
            >
            Hello  ${companyName},
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-weight: 500;
                letter-spacing: 0.56px;
              "
            >
          
            Thank you for registration, next step to access the platform your email needs to be verified.
            <br/> 
            Please enter below OTP on platform.
            </p>
            <p
              style="
                margin: 0;
                margin-top: 60px;
                font-size: 40px;
                font-weight: 600;
                letter-spacing: 25px;
                color: #ba3d4f;
              "
            >
              ${otp}
            </p>
          </div>
        </div>

        <p
          style="
            max-width: 400px;
            margin: 0 auto;
            margin-top: 90px;
            text-align: center;
            font-weight: 500;
            color: #8c8c8c;
          "
        >
          Need help? Ask at
          <a
            href="mailto:ipangram@gmail.com"
            style="color: #499fb6; text-decoration: none"
            >ipangram@gmail.com</a
          >
          or visit our
          <a
            href=""
            target="_blank"
            style="color: #499fb6; text-decoration: none"
            >Help Center</a
          >
        </p>
      </main>

      <footer
        style="
          width: 100%;
          max-width: 490px;
          margin: 20px auto 0;
          text-align: center;
          border-top: 1px solid #e6ebf1;
        "
      >
        <p
          style="
            margin: 0;
            margin-top: 40px;
            font-size: 16px;
            font-weight: 600;
            color: #434343;
          "
        >
          Ipangram Company
        </p>
        <p style="margin: 0; margin-top: 8px; color: #434343">
          Address 540, City, State.
        </p>

        <p style="margin: 0; margin-top: 16px; color: #434343">
          Copyright © 2024 Company. All rights reserved.
        </p>
      </footer>
    </div>
  </body>
</html>
`;

  return template;
};

const resetPasswordTemplate = (link, companyName) => {
  const resetPassword = `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Static Template</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #ffffff;
      font-size: 14px;
    "
  >
    <div
      style="
        max-width: 680px;
        margin: 0 auto;
        padding: 45px 30px 60px;
        background: #f4f7ff;
        background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
        background-repeat: no-repeat;
        background-size: 800px 452px;
        background-position: top center;
        font-size: 14px;
        color: #434343;
      "
    >
      <main>
        <div
          style="
            margin: 0;
            margin-top: 70px;
            padding: 92px 30px 115px;
            background: #ffffff;
            border-radius: 30px;
            text-align: center;
          "
        >
          <div style="width: 100%; max-width: 489px; margin: 0 auto">
            <h1
              style="
                margin: 0;
                font-size: 24px;
                font-weight: 500;
                color: #1f1f1f;
              "
            >
              Reset your assword
            </h1>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-size: 16px;
                font-weight: 500;
              "
            >
              Hello ${companyName},
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                margin-bottom: 30px;
                font-weight: 500;
                letter-spacing: 0.56px;
              "
            >
              We got your request to reset your password. Please click the link
              below to reset your new password.
            </p>
            <a
              href="${link}"
              style="
                margin: 0;
                min-width: 100%;

                margin-top: 60px;
                font-size: 20px;
                font-weight: 600;
                border-radius: 20px;
                color: #ffffff;
                padding: 10px;
                text-decoration: none;
                background-color: #0ee69a;
              "
            >
              Reset Password
            </a>
          </div>
        </div>

        <p
          style="
            max-width: 400px;
            margin: 0 auto;
            margin-top: 60px;
            text-align: center;
            font-weight: 500;
            color: #8c8c8c;
          "
        >
          Need help? Ask at
          <a
            href="mailto:ipangram@gmail.com"
            style="color: #499fb6; text-decoration: none"
            >ipangram@gmail.com</a
          >
          or visit our
          <a
            href=""
            target="_blank"
            style="color: #499fb6; text-decoration: none"
            >Help Center</a
          >
        </p>
      </main>

      <footer
        style="
          width: 100%;
          max-width: 490px;
          margin: 20px auto 0;
          text-align: center;
          border-top: 1px solid #e6ebf1;
        "
      >
        <p
          style="
            margin: 0;
            margin-top: 40px;
            font-size: 16px;
            font-weight: 600;
            color: #434343;
          "
        >
          Ipangram Company
        </p>
        <p style="margin: 0; margin-top: 8px; color: #434343">
          Address 540, City, State.
        </p>

        <p style="margin: 0; margin-top: 16px; color: #434343">
          Copyright © 2024 Company. All rights reserved.
        </p>
      </footer>
    </div>
  </body>
</html>

`;

  return resetPassword;
};

const registrationTemplate = (companyName) => {
  const registerTemplate = `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Static Template</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #ffffff;
      font-size: 14px;
    "
  >
    <div
      style="
        max-width: 680px;
        margin: 0 auto;
        padding: 45px 30px 60px;
        background: #f4f7ff;
        background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
        background-repeat: no-repeat;
        background-size: 800px 452px;
        background-position: top center;
        font-size: 14px;
        color: #434343;
      "
    >
      <main>
        <div
          style="
            margin: 0;
            margin-top: 70px;
            padding: 92px 30px 115px;
            background: #ffffff;
            border-radius: 30px;
            text-align: center;
          "
        >
          <div style="width: 100%; max-width: 489px; margin: 0 auto">
            <h1
              style="
                margin: 0;
                font-size: 24px;
                font-weight: 500;
                color: #1f1f1f;
              "
            >
              Thank You
            </h1>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-size: 16px;
                font-weight: 500;
              "
            >
              ${companyName},
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-weight: 500;
                letter-spacing: 0.56px;
              "
            >
              Congratulations! Your verificaiton with ${companyName} has been
              successfully processed, and we are thrilled to welcome you aboard.
            </p>
            <p
              style="
                margin: 0;

                margin-top: 60px;
                font-size: 20px;
                font-weight: 600;
                border-radius: 20px;
                color: #ffffff;
                padding: 10px;

                background-color: #0ee69a;
              "
            >
              Registration Successfull
            </p>
          </div>
        </div>

        <p
          style="
            max-width: 400px;
            margin: 0 auto;
            margin-top: 90px;
            text-align: center;
            font-weight: 500;
            color: #8c8c8c;
          "
        >
          Need help? Ask at
          <a
            href="mailto:ipangram@gmail.com"
            style="color: #499fb6; text-decoration: none"
            >ipangram@gmail.com</a
          >
          or visit our
          <a
            href=""
            target="_blank"
            style="color: #499fb6; text-decoration: none"
            >Help Center</a
          >
        </p>
      </main>

      <footer
        style="
          width: 100%;
          max-width: 490px;
          margin: 20px auto 0;
          text-align: center;
          border-top: 1px solid #e6ebf1;
        "
      >
        <p
          style="
            margin: 0;
            margin-top: 40px;
            font-size: 16px;
            font-weight: 600;
            color: #434343;
          "
        >
          Ipangram Company
        </p>
        <p style="margin: 0; margin-top: 8px; color: #434343">
          Address 540, City, State.
        </p>

        <p style="margin: 0; margin-top: 16px; color: #434343">
          Copyright © 2024 Company. All rights reserved.
        </p>
      </footer>
    </div>
  </body>
</html>
`;
  return registerTemplate;
};

module.exports = {
  emailVerificationTemplate,
  resetPasswordTemplate,
  registrationTemplate,
};
