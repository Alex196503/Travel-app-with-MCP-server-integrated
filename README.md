# Tourism application
VoyageFlow is a full-stack travel booking platform for discovering trips, managing reservations, processing Stripe payments, and sharing traveler reviews, built with React, Node.js, Prisma, and MySQL.

# Key features

* **Trip discovery**: Browse trips, search and filter by category, country, and price, then view trip details and images.
* **Booking management**: Reserve seats, view bookings, and manage or cancel reservations.
* **Stripe payments**: Create checkout sessions and process payment events through Stripe webhooks.
* **Authentication and profiles**: Register and log in, verify email, reset passwords, and update profile details.
* **Reviews and replies**: Create, edit, and delete trip reviews and threaded replies.
* **Real-time notifications**: Deliver booking and payment updates through Server-Sent Events.
* **AI-assisted country information**: A Gemini-powered assistant uses an MCP server with tools for country lookup, regional lists, comparisons, population rankings, and language searches.
* **Media and email integrations**: Cloudinary image storage and Nodemailer email delivery.
* **Ticket chat over WebSockets**: Authenticated, real-time ticket conversations over WebSockets, with messages saved to the database.
* **Testing**: Vitest unit tests for booking, calendar, and utility logic; React Testing Library component tests for forms and UI interactions; and Supertest API route tests with mocked services. These are route-level tests, not full database end-to-end tests.

# Tech Stack

* **Languages**: TypeScript
* **Frontend**: React, React Router, Tailwind CSS, Vite
* **Backend**: Node.js, Express, REST APIs, WebSockets (ws), Server-Sent Events
* **Database**: MySQL, Prisma ORM
* **Integrations**: Stripe Checkout and webhooks, Google Gemini, Model Context Protocol (MCP), Cloudinary, Nodemailer
* **Validation and auth**: Zod, JWT, bcrypt
* **Testing**: Vitest, React Testing Library, user-event, Supertest, jsdom
* **Dev-ops**: Docker, Railway.


## Local Docker setup
Keep `.env` for running the backend directly on the host. Docker uses a separate,
untracked `.env.docker` file so its database credentials do not override the
passwordless local MySQL configuration.

Copy `.env.docker.example` to `.env.docker`, set distinct random hexadecimal
values for `DOCKER_DB_PASSWORD` and `DOCKER_DB_ROOT_PASSWORD`, then start Docker:

```powershell
Copy-Item .env.docker.example .env.docker
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
docker compose --env-file .env.docker up --build
```



Use one generated value for each password. The Docker backend connects as the
limited `voyageflow` database user; MySQL root is reserved for administration.
The host database port is bound to `127.0.0.1` and defaults to `3307`. Docker
containers connect to MySQL over the private Compose network at `db:3306`.

MySQL's initialization variables only create users and set passwords when the
data directory is empty. If you already have the old passwordless Docker data
volume, do not delete it if you need its data. Either migrate/backup that data
before recreating the volume, or create the `voyageflow` user and set the root
password manually in the existing MySQL instance to match `.env.docker`.


## Stripe webhooks with Docker

For local payment testing, keep the Docker services running and start the Stripe CLI in a separate terminal:

```bash
stripe login
stripe listen --forward-to http://localhost:5000/api/payments/webhook
```
Copy the webhook signing secret printed by stripe listen (it starts with whsec_) into STRIPE_WEBHOOK_SECRET in your local .env file. Keep that value private and do not commit it. Restart the backend container after changing .env.

Leave stripe listen running while testing payments. It forwards Stripe events to the Docker backend through the host's port 5000.

## Deployment 

I successfully deployed the application to production using Render to showcase it as a functional MVP. Although some features like cookies and SMTP email delivery encountered configuration limits in the deployed environment and were left scaled back, the complete feature set remains fully implemented and operational on localhost.

## Database schema
Our relational database(made in SQL) follows a relational structure to manage bookings, scheduling, countries, users, ticketing and reviews. The following ERD diagram was designed in Lucidchart to map out the database arhitecture, relationships, and core functionalities before writing any SQL code or setting up the database.
> [!NOTE]
>  All main entities like users, bookings, tours, payments, reviews, etc, will include timestamp fields like **created_at** and **updated_at**, so we can keep track
> of the last tours made, when was the reservation booked, when was the payment processed, having a **TIMESTAMP** data type, to track time accurately across our time
> zone. These attributes were omitted from the initial ERD diagram to maintain visual clarity.
> Due to spatial constraints in the ERD diagram, explicit ENUM status fields (such as 'pending', 'confirmed', or 'cancelled') were omitted from certain tables. However, they are a core architectural component used across the application to cleanly manage transactional lifecycles and states atomically.

<img width="2909" height="1542" alt="Database ER diagram (crow&#39;s foot) (5)" src="https://github.com/user-attachments/assets/ac8a3e4b-f964-45d7-89aa-ce73a6ff0839" />


## Key relationships:
* A **many-to-many** relationships between users and trips, connected by a junction table, called bookings. It enables users to book multiple trips and trips to have multiple attendees flexibly.
* A **one-to-many** relationship between **Users** and **Tickets**. Each user can open multiple support tickets regarding their bookings or general inquiries.
* A **one-to-many** relationship between **Bookings** and **Payments**. Each booking can have one payment, but the payments table tracks the full transaction history including Stripe payment intent IDs. We also have a **self-referencing one-to-many relationship**, where the table references itself through a  _reply_to_id_ foreign key pointing to its own _id_. In this way, a single message(or reply) can have multiple(limit on 2-3) replies(one-to-many), whilst each reply points back to a single parent message.


## Formal norms & Normalization
* As far as the formal norms go, the **first normal form(1NF)** is respected across the database. For example, while storing multiple trip images as an array within a single column might have seemed convenient, it would have violated 1NF. To maintain atomicity and proper relational integrity, these were refactored into a separate images table with a One-to-Many relationship. The database schema inherently satisfies the **Second Normal Form (2NF)** because all tables utilize a single, atomic primary key (such as a unique id) rather than composite candidate keys, completely eliminating the possibility of partial dependencies.
* The schema deliberately accommodates or highlights transitive dependencies (where a non-key attribute depends on another non-key attribute, such as available_seats depending on total_seats, or token expiration linked to a token), which technically creates a deviation from the strict rules of the **Third Normal Form (3NF)** in favor of application performance and caching convenience.

## Project status:

* Status: **Completed**
* Author: Moldovan Alex-Cristian
