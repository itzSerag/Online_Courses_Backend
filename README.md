
<p align="center">
    <h1 align="center">ONLINE_COURSES_BACKEND.GIT</h1>
</p>
<p align="center">
    <em>Empowering online learning through seamless backend integration.</em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/itzSerag/Online_Courses_Backend.git?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/itzSerag/Online_Courses_Backend.git?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/itzSerag/Online_Courses_Backend.git?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/itzSerag/Online_Courses_Backend.git?style=default&color=0080ff" alt="repo-language-count">
</p>
<p align="center">
	<!-- default option, no dependency badges. -->
</p>

<br>

#####  Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Repository Structure](#-repository-structure)
- [ Modules](#-modules)
- [ Getting Started](#-getting-started)
    - [ Prerequisites](#-prerequisites)
    - [ Installation](#-installation)
    - [ Usage](#-usage)
    - [ Tests](#-tests)
- [ Project Roadmap](#-project-roadmap)
- [ Contributing](#-contributing)
- [ License](#-license)
- [ Acknowledgments](#-acknowledgments)

---

##  Overview

The Online Courses Backend project serves as a robust platform for managing user authentication, payments, uploads, and course progress tracking. Leveraging NestJS and Prisma ORM, it facilitates secure user interactions, admin controls, and seamless content management. Features include JWT authentication, social login, OTP handling, and payment processing with Paymob integration. Structured endpoints for data operations and file uploads ensure efficient backend functionality. As part of its value proposition, the project enables personalized learning experiences through user task completion tracking and course progression management.

---

##  Features

|    |   Feature         | Description |
|----|-------------------|---------------------------------------------------------------|
| ⚙️  | **Architecture**  | NestJS backend architecture with Prisma ORM for data management and AWS S3 for file storage. Organized directory layout, global prefix, and CORS settings ensure secure API interactions. Extensive use of modules for clear separation of concerns. |
| 🔩 | **Code Quality**  | Well-structured codebase with TypeScript, adhering to ES2021 features. Consistent coding style, linting with ESLint, and integrated Prettier for code formatting. Leveraging TypeScript type-checking and good separation of concerns within modules. |
| 📄 | **Documentation** | Detailed documentation present, covering the core functionality, modules, services, and controllers. Prisma schema, database migrations, and endpoint descriptions are well-documented. Improves code maintainability and onboarding for new developers. |
| 🔌 | **Integrations**  | Integrated AWS S3 for file storage, Passport for authentication, Prisma ORM for database operations, and external APIs for payment processing. Utilizes Jest for testing and Node-fetch for HTTP requests. |
| 🧩 | **Modularity**    | Highly modular codebase with separate modules for authentication, payments, uploads, users, and Prisma integration. Encourages code reusability, maintainability, and scalability in the project. |
| 🧪 | **Testing**       | Testing framework Jest used for unit testing and e2e testing. Ensures code reliability and functionality verification. E2e testing for endpoints like greeting message validation. |
| ⚡️  | **Performance**   | No specific performance details given. Efficient usage of AWS S3 for file storage, Prisma for database operations, and NestJS for API handling. Scaling potential with proper design and testing. |
| 🛡️ | **Security**      | Implements JWT authentication, Facebook, and Google OAuth strategies. Secure file uploads to AWS S3 with pre-signed URLs. Guards for admin access and user verification. Secure password handling and email verification for user accounts. |
| 📦 | **Dependencies**  | Key dependencies include NestJS, Prisma, Passport, AWS SDK, Jest, TypeScript, ESLint, Prettier. Utilizes various libraries for ORM, authentication, testing, and file management. |
| 🚀 | **Scalability**   | Modular architecture and use of Prisma ORM facilitate scalability. AWS S3 for file storage ensures scalability for media files. NestJS framework provides scalability options for increased traffic and load handling. |

---

##  Repository Structure

```sh
└── Online_Courses_Backend.git/
    ├── README.md
    ├── nest-cli.json
    ├── package-lock.json
    ├── package.json
    ├── prisma
    │   ├── migrations
    │   └── schema.prisma
    ├── src
    │   ├── app.controller.ts
    │   ├── app.module.ts
    │   ├── app.service.ts
    │   ├── auth
    │   ├── common
    │   ├── data
    │   ├── main.ts
    │   ├── payment
    │   ├── prisma
    │   ├── shared
    │   ├── upload
    │   ├── users
    │   └── util
    ├── test
    │   ├── app.e2e-spec.ts
    │   └── jest-e2e.json
    ├── tsconfig.build.json
    ├── tsconfig.json
    └── vercel.json
```

---

##  Modules

<details closed><summary>.</summary>

| File | Summary |
| --- | --- |
| [nest-cli.json](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/nest-cli.json) | Defines schema for NestJS CLI, setting source root at src for schematics collection by @nestjs/schematics. Compiler option deleteOutDir is enabled, facilitating file deletion during compilation. |
| [package-lock.json](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/package-lock.json) | This code file, `app.service.ts`, plays a crucial role in the Online Courses Backend repository. It focuses on managing various business logic and data operations essential for the applications functionality. By handling key services and operations, it ensures seamless communication between different components within the system. This file encapsulates the core services needed to power the online courses platform, contributing to its overall robustness and efficiency. |
| [package.json](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/package.json) | Orchestrates build processes, linting, testing, and starting the app with multiple scripts. Manages dependencies for AWS S3, NestJS authentication, Prisma ORM, Express, and more. Enhanced by dev dependencies for testing and TypeScript tooling. |
| [tsconfig.build.json](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/tsconfig.build.json) | Optimize TypeScript build configuration by excluding unnecessary files, improving compilation speed, and enhancing project maintainability. |
| [tsconfig.json](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/tsconfig.json) | Defines compiler options for enabling ES2021 features, commonjs module format, and source maps generation to support TypeScript build process. Configures Jest, Express, Multer types for type-checking. Maintains a structured directory layout by setting outDir and baseUrl properties. |
| [vercel.json](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/vercel.json) | Defines Vercel deployment settings for the backend app, specifying source and build configurations. Manages API rewrites and sets CORS headers to handle cross-origin requests securely within the Online Courses project architecture. |

</details>

<details closed><summary>prisma</summary>

| File | Summary |
| --- | --- |
| [schema.prisma](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/prisma/schema.prisma) | Defines data models for users, levels, tasks, progress, and orders. Specifies relationships and attributes for building an online courses backend system. Organizes database schema efficiently for user management and course progression tracking. |

</details>

<details closed><summary>src</summary>

| File | Summary |
| --- | --- |
| [app.controller.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/app.controller.ts) | Exposes endpoint for retrieving a greeting message from the App Service in the Online Courses Backend repository. |
| [app.module.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/app.module.ts) | Coordinates module imports, controllers, and providers for user authentication, data management, uploads, and payments. Integrates essential services like Prisma, configuration, and app logic within the NestJS backend architecture. |
| [app.service.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/app.service.ts) | Provides core functionality.-Renders a greeting message.-Integral component of the backend logic.-Essential for application service layer.-NestJS framework Injectable dependency. |
| [main.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/main.ts) | Defines a global prefix, CORS settings, and request validation for the NestJS application in the backend, ensuring secure and standardized API interactions at port 5000. |

</details>

<details closed><summary>test</summary>

| File | Summary |
| --- | --- |
| [app.e2e-spec.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/test/app.e2e-spec.ts) | Verifies the e2e testing of the AppController by setting up and initializing the Nest application. Validates the / (GET) endpoint response to ensure the system returns Hello World! with a status code of 200. |
| [jest-e2e.json](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/test/jest-e2e.json) | Configures Jest for end-to-end testing in the project, enabling Node.js environment with TypeScript support. Identifies test files, sets up module extensions, and transforms TypeScript code. |

</details>


<details closed><summary>prisma.migrations.20241010101643_new_design</summary>



<details closed><summary>src.auth</summary>

| File | Summary |
| --- | --- |
| [auth.controller.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/auth.controller.ts) | Manages user authentication and authorization with JWT, Facebook, and Google OAuth. Implements login, signup, password reset, OTP verification, and logout functionalities. Handles user redirects after social login. |
| [auth.email.service.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/auth.email.service.ts) | Enables sending OTP emails via AWS SES. Configured with access key, secret key, and region. Constructs email content with OTP. Sends email using SES, handling errors and resolution. |
| [auth.module.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/auth.module.ts) | Enables user authentication with JWT, Google, Facebook strategies. Integrates Passport for authorization. Exposes AuthService and JwtAuthGuard functionalities. Enhances project security and user login experience. |
| [auth.otp.service.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/auth.otp.service.ts) | Implements OTP services for user authentication. Manages OTP creation, verification, retrieval, and deletion using a Prisma database connection. This file contributes to user authentication functionality in the Online Courses Backend repository. |
| [auth.service.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/auth.service.ts) | Manages user authentication, authorization, and account verification. Implements signup, login, password reset, OTP handling, OAuth user creation, token generation, OTP verification, and logout functionalities within the Online Courses Backend system. |

</details>

<details closed><summary>src.payment</summary>

| File | Summary |
| --- | --- |
| [paymob.controller.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/payment/paymob.controller.ts) | Implements payment callbacks and processing, and order refunds in a secured manner using JWT authentication. Handles payment transactions, processes refunds, and interacts with external APIs. Manages user data and verifies payment details before processing. |
| [paymob.module.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/payment/paymob.module.ts) | Defines PaymentModule to manage payment-related functionalities by integrating Paymob service. Leverages PaymobService for business logic, PaymobController for handling requests, and integrates with UsersModule and AuthModule for user authentication and authorization. |
| [paymob.service.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/payment/paymob.service.ts) | Enables payment processing through Paymob API-Integrates payment intentions, order processing, callback handling, and order refunds-Utilizes NestJS framework, Prisma ORM, and config service seamlessly within the repository architecture. |

</details>

<details closed><summary>src.prisma</summary>

| File | Summary |
| --- | --- |
| [prisma.controller.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/prisma/prisma.controller.ts) | Manages Prisma-related operations through endpoints defined in the prisma.controller.ts file in the src/prisma directory, facilitating seamless integration within the larger Online Courses Backend architecture. |
| [prisma.module.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/prisma/prisma.module.ts) | Enables global access to Prisma service and controller in the backend architecture. Responsible for managing interactions with the Prisma ORM for database operations within the NestJS framework. |
| [prisma.service.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/prisma/prisma.service.ts) | Manages Prisma client instantiation and data operations-Creates and finds users in the database-Handles connection initialization and termination for efficient usage in the NestJS application. |

</details>

<details closed><summary>src.upload</summary>

| File | Summary |
| --- | --- |
| [upload.controller.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/upload/upload.controller.ts) | Manages file uploads, deletions, and retrieval-Ensures file type validity before uploading-Requires admin permissions for file management-Associates files with content metadata for organization-Enhances security with JWT authentication and guards |
| [upload.module.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/upload/upload.module.ts) | Enables file uploading functionality by exporting UploadService, connecting UploadController, and managing related services within the parent Online_Courses_Backend.git repositorys architecture. |
| [upload.service.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/upload/upload.service.ts) | Manages file uploads, deletions, and retrievals to/from AWS S3. Utilizes pre-signed URLs for secure access. Implements uploading, deleting, and content retrieval methods for structured file storage in the Online_Courses_Backend.git repository architecture. |

</details>

<details closed><summary>src.users</summary>

| File | Summary |
| --- | --- |
| [users.controller.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/users/users.controller.ts) | Authentication, CRUD, level & task completion. Implements admin, JWT guards, user permissions. Enhances user experience by allowing tasks and days to be marked as completed. |
| [users.module.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/users/users.module.ts) | Orchestrates user-related services and controllers with dependency injection, contributing to a modular and maintainable system architecture. |
| [users.service.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/users/users.service.ts) | Manages user data, including creation, retrieval, update, and deletion. Implements user authentication methods, user verification, and tasks completion tracking. Facilitates access to user orders and progress. Handles level-based operations ensuring user access rights. |

</details>

<details closed><summary>src.util</summary>

| File | Summary |
| --- | --- |
| [file-data-courses.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/util/file-data-courses.ts) | Retrieves course data from a JSON file based on the environment. Validates file existence and reads the data using File System module, ensuring reliable access to course information within the repositorys architecture. |

</details>

<details closed><summary>src.auth.dto</summary>

| File | Summary |
| --- | --- |
| [authDtos.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/dto/authDtos.ts) | SignUpDto, LoginDto, UpdateUserDto for user registration, login, and information update. Include a payload structure for authentication details. Enhances user management in the application. |
| [index.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/dto/index.ts) | Exports authentication data transfer objects for the backend, facilitating structured data communication within the system. Centralizes and simplifies the sharing of authentication-related DTOs across modules for improved code organization and maintainability. |

</details>

<details closed><summary>src.auth.guard</summary>

| File | Summary |
| --- | --- |
| [admin.guard.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/guard/admin.guard.ts) | Verifies admin access rights based on user role. Uses Nest.js framework for guard implementation. Checks if user is authenticated as an admin before allowing access, throwing an unauthorized exception if not. |
| [index.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/guard/index.ts) | Enables authentication guardians for admin access and JWT authenticity verification within the repositorys authentication module. |
| [isVerified.guard.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/guard/isVerified.guard.ts) | Validates user verification status before granting access within the authentication flow in the repository. Aborts unauthorized access if the user is not verified, ensuring only verified users proceed with requested actions. |
| [jwt.auth.guard.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/guard/jwt.auth.guard.ts) | Enables JWT authentication in NestJS project by utilizing Passport. |

</details>

<details closed><summary>src.auth.strategy</summary>

| File | Summary |
| --- | --- |
| [facebook.strategy.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/strategy/facebook.strategy.ts) | Implements Facebook authentication strategy using OAuth for the Online Courses Backend. Validates user profile data and maps it to the systems user model for seamless login via Facebook credentials. |
| [google.strategy.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/strategy/google.strategy.ts) | Enables Google OAuth integration for user authentication in the backend. Validates Google user data and constructs the user object for further processing within the applications authentication flow. |
| [jwt.strategy.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/auth/strategy/jwt.strategy.ts) | Implements JWT authentication strategy for user validation. Validates payload, retrieves user data, and omits password for secure authentication within the Online_Courses_Backend repositorys architecture. |

</details>

<details closed><summary>src.common.logger</summary>

| File | Summary |
| --- | --- |
| [logger.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/common/logger/logger.ts) | Defines structured logging with JSON format using Winston in the common/logger/logger.ts file. It configures a logger with an info level, timestamp, and console transport for serverless environments in the Online Courses Backend repository. |

</details>

<details closed><summary>src.payment.dto</summary>

| File | Summary |
| --- | --- |
| [index.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/payment/dto/index.ts) | Defines DTOs for payment related data transfer objects, centralizing data structure definitions for payment operations. Supports seamless communication between various payment modules within the backend architecture. |
| [orderData.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/payment/dto/orderData.ts) | Defines payment request data structure ensuring validation and type safety for online course purchases in the backend system. |

</details>

<details closed><summary>src.payment.types</summary>

| File | Summary |
| --- | --- |
| [callback.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/payment/types/callback.ts) | Defines payment callback interfaces with detailed transaction and order data structures. Facilitates seamless integration and communication between payment processing systems and the application, ensuring accurate processing and tracking of payment transactions. |
| [index.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/payment/types/index.ts) | Exports payment type for module integration. |
| [payment.type.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/payment/types/payment.type.ts) | Defines item structure, billing data, payment request, HMAC validation format, and payment status enum for processing transactions securely and accurately within the payment module of the online course backend system. |

</details>

<details closed><summary>src.shared.enums</summary>

| File | Summary |
| --- | --- |
| [index.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/shared/enums/index.ts) | Exports the level_name.enum from the enums directory within the shared module. Facilitates consistent usage of course level names across the backend, enhancing code readability and maintainability in the Online Courses project. |
| [level_name.enum.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/shared/enums/level_name.enum.ts) | Define level names for course proficiency in the shared enums file. Organize proficiency levels from A1 to C2 for the online courses backend system architecture. |

</details>

<details closed><summary>src.upload.dto</summary>

| File | Summary |
| --- | --- |
| [awsDtos.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/upload/dto/awsDtos.ts) | Defines validation rules for uploading daily course content in AWS, enforcing item name, stage, and day format. Maintains data integrity and consistency within the Online Courses Backend architecture. |
| [index.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/upload/dto/index.ts) | Exports AWS-related DTOs for file uploads, streamlining data transfer handling in the Online Courses Backend repository. |

</details>

<details closed><summary>src.users.dto</summary>

| File | Summary |
| --- | --- |
| [index.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/users/dto/index.ts) | Exports userDays.dto and userTasks.dto for use in the users module. Facilitates data exchange within the Online Courses Backend repository. |
| [userDays.dto.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/users/dto/userDays.dto.ts) | Enhance user validation by enforcing enum constraints for levelName in user-related operations. Critical for ensuring data integrity and consistency within the Online Courses Backend system. |
| [userTasks.dto.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/users/dto/userTasks.dto.ts) | Defines user task data structure with validation rules for level, day, and task name. Crucial for ensuring data consistency and integrity within the user tasks module of the Online Courses Backend. |

</details>

<details closed><summary>src.users.types</summary>

| File | Summary |
| --- | --- |
| [fetched.users.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/users/types/fetched.users.ts) | Defines types for users with and without passwords to maintain data integrity and security in user-related operations within the Online Courses Backend repositorys architecture. |
| [index.ts](https://github.com/itzSerag/Online_Courses_Backend.git/blob/main/src/users/types/index.ts) | Exports fetched user types for seamless integration across the backend, enhancing modular structure and code reuse. |

</details>

---

##  Getting Started

###  Prerequisites

**TypeScript**: `version x.y.z`

###  Installation

Build the project from source:

1. Clone the Online_Courses_Backend.git repository:
```sh
❯ git clone https://github.com/itzSerag/Online_Courses_Backend.git
```

2. Navigate to the project directory:
```sh
❯ cd Online_Courses_Backend.git
```

3. Install the required dependencies:
```sh
❯ npm install
```

###  Usage

To run the project, execute the following command:

```sh
❯ npm run build && node dist/main.js
```
