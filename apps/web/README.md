<!-- markdownlint-disable-file MD033 -->
<!-- markdownlint-disable-next-line MD041 -->
<div align="center">

![ActivityRank Wordmark](https://raw.githubusercontent.com/activityrankbot/assets/main/banners/wordmark.png)

# ActivityRank Web

[![License](https://img.shields.io/github/license/Rapha01/activityRank-bot?style=for-the-badge)](https://github.com/Rapha01/activityRank-bot/blob/main/LICENSE.txt)
[![Support Server](https://img.shields.io/discord/534598374985302027?style=for-the-badge&logo=discord&label=support%20server&link=https%3A%2F%2Factivityrank.me/support)](https://activityrank.me/support)

</div>

This is the directory containing the ActivityRank website.

---


## Getting Started

> [!IMPORTANT]
> If you only want to use the bot, invite it to your Discord server with [this link.](https://activityrank.me/invite)

### Prerequisites

Before you start developing, make sure you have the following installed:

* Node.js (v20.x or higher required)
* Pnpm

### Setting Up the Project

1. Clone the repository:

    ```sh
    git clone https://github.com/Rapha01/activityRank-bot.git activityrank
    cd activityrank
    ```

2. Install dependencies:

    ```sh
    pnpm --filter=web install
    ```

3. Add secrets:

    Populate the [`.env.local`](./.env.local) file, based on the template in [`.env`](./.env).

4. Start the development server:

    ```sh
    pnpm --filter=web run dev
    ```

The development website will be available at [`http://localhost:5173`](http://localhost:5173).

## Building for Production

Create a production build:

```bash
pnpm --filter=web run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```
## Contributing

We welcome contributions! If you’d like to contribute, follow these steps:

1. Fork the repository and clone it to your local machine.
2. Make your changes in a separate branch.
3. Run tests and linting to ensure your code is in good shape.
4. Create a pull request with a clear explanation of what you’ve changed.

For large changes, it's a good idea to discuss them first by opening an issue.

Feel free to contact a maintainer on Discord -
send a message request to [`@piemot`](https://discord.com/users/270273690074087427)
or ask around in the [support server](https://activityrank.me/support).

## License

This project is licensed under the AGPL v3.0 License - see the [LICENSE](LICENSE.txt) file for details.

## Known Issues

1.  Cookies are used for authentication purposes. To prevent CSRF (Cross-Site Request Forgery) attacks,
    the `SameSite=Lax` attribute is used on all security-critical cookies.
    Older browsers such as Internet Explorer 11 or older may not respect this attribute.

    See the [Remix docs](https://remix.run/docs/en/main/guides/browser-support#does-remix-implement-csrf-protection)
    for more details.

    I'm not averse to adding more CSRF protection features - a good place to start looking would be
    [this article by Sergio Xalambrí](https://sergiodxa.com/articles/adding-csrf-protection-to-remix)
