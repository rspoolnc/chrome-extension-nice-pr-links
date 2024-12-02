// Should only run on GitHub PR page. See manifest.json "content_scripts.matches"
// There are sub-pages like "Commits" and "Files changed", should work there too
// So URL should look like https://github.com/OrgName/RepoName/pull/9999/subpage
const pullRequestTitle = document.querySelector(".gh-header-title");
if (pullRequestTitle) {
    const href = location.href;
    // Extract the repo name from the URL
    const repository = href.match(/github\.com\/[^\/]+\/([^\/]+)\/pull/)[1]
    // Get the full URL of the PR root (not subpages like "Files changed")
    const prRootUrl = href.match(/(^.*github\.com\/[^\/]+\/[^\/]+\/pull\/\d+)\/.*/i)[1]
    // Get the PR number
    const prNumber = href.match(/^.*github\.com\/[^\/]+\/[^\/]+\/pull\/(\d+)\/.*/i)[1]

    let text = pullRequestTitle.textContent;
    // Get the JIRA ticket slug
    const jiraTicketSlug = text.match(/[a-zA-Z]{1,4}-\d+/)[0]
    // Remove the leading JIRA ticket slug
    text = text.replace(/\s+[a-zA-Z]{1,4}-\d+\s+/, '')
    // Remove PR number at the end
    text = text.replace(/\s+(#\d+)/, '')
    // Assemble the nice final thing (text before now should just be the PR title)
    text = text.trim()
    text =
      `[PR ${repository}#${prNumber}](${prRootUrl}): `
      + text
      + ` [${jiraTicketSlug}](https://navigatingcancer.atlassian.net/browse/${jiraTicketSlug})`
    text = text.trim()
    const button = document.createElement("button");
    button.textContent = `Copy link`;

    pullRequestTitle.insertAdjacentElement("afterend", button);
    button.addEventListener("click", async () => {
        try {
            await copyTextToClipboard(text)
            const originalHTML = button.innerHTML;
            button.innerText = "Copied!"
            setTimeout(() => {
                button.innerHTML = originalHTML;
            }, 3000)
        } catch(error) {
            console.error("EXTENSION ERROR CAUGHT:")
            console.error(error);
            button.innerText = "ERROR logged to console";
        }
    })
}

/**
 * Copy to clipboard with fallback. Not really necessary but w/e
 * From https://stackoverflow.com/a/30810322
 */
function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  return navigator.clipboard.writeText(text)
}
