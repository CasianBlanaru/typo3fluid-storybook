import { createHeader, type User } from './Header'; // Import User type
import './page.css';

export const createPage = (): HTMLElement => {
  const article = document.createElement('article');
  let user: User | null = null; // Explicitly type user, can be User or null

  // Function to create the header element, ensures it's always fresh
  const createHeaderElement = (): HTMLElement => {
    return createHeader({
      user, // Pass the current user state
      onLogin: () => {
        user = { name: 'Jane Doe' };
        rerenderHeader();
      },
      onLogout: () => {
        user = null;
        rerenderHeader();
      },
      onCreateAccount: () => {
        user = { name: 'Jane Doe' }; // Or a different new account state
        rerenderHeader();
      },
    });
  };

  // Function to re-render the header
  // It replaces the existing header in the article element
  const rerenderHeader = () => {
    const oldHeader = article.querySelector('header');
    const newHeader = createHeaderElement();
    if (oldHeader) {
      article.replaceChild(newHeader, oldHeader);
    } else {
      // If no header exists yet (e.g., initial render), prepend it
      article.prepend(newHeader);
    }
  };


  // Initial header creation and appending
  const headerElement = createHeaderElement();
  article.appendChild(headerElement); // Append the first header

  const section = document.createElement('section');
  section.className = 'storybook-page';
  section.innerHTML = `
    <h2>Pages in Storybook</h2>
    <p>
      We recommend building UIs with a
      <a
        href="https://blog.hichroma.com/component-driven-development-ce1109d56c8e"
        target="_blank"
        rel="noopener noreferrer">
        <strong>component-driven</strong>
      </a>
      process starting with atomic components and ending with pages.
    </p>
    <p>
      Render pages with mock data. This makes it easy to build and review page states without
      needing to navigate to them in your app. Here are some handy patterns for managing page data
      in Storybook:
    </p>
    <ul>
      <li>
        Use a higher-level connected component. Storybook helps you compose such data from the
        "args" of child component stories
      </li>
      <li>
        Assemble data in the page component from your services. You can mock these services out
        using Storybook.
      </li>
    </ul>
    <p>
      Get a guided tutorial on component-driven development at
      <a href="https://storybook.js.org/tutorials/" target="_blank" rel="noopener noreferrer">
        Storybook tutorials
      </a>
      . Read more in the
      <a href="https://storybook.js.org/docs" target="_blank" rel="noopener noreferrer">docs</a>
      .
    </p>
    <div class="tip-wrapper">
      <span class="tip">Tip</span>
      Adjust the width of the canvas with the
      <svg width="10" height="10" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
          <path
            d="M1.5 5.2h4.8c.3 0 .5.2.5.4v5.1c-.1.2-.3.3-.4.3H1.4a.5.5 0
            01-.5-.4V5.7c0-.3.2-.5.5-.5zm0-2.1h6.9c.3 0 .5.2.5.4v7a.5.5 0 01-1 0V4H1.5a.5.5 0
            010-1zm0-2.1h9c.3 0 .5.2.5.4v9.1a.5.5 0 01-1 0V2H1.5a.5.5 0 010-1zm4.3 5.2H2V10h3.8V6.2z"
            id="a"
            fill="#999" />
        </g>
      </svg>
      Viewports addon in the toolbar
    </div>
  `;

  article.appendChild(section);

  return article;
};
