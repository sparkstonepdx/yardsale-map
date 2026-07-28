# Yard Sale Map

Run a neighborhood yard-sale map from a Google Form. Neighbors fill out a form to
list their sale, and it automatically shows up on a map and in a searchable list
on your website.

You get four pieces you can place anywhere on your page:

- A **map** with a pin for each sale (and, optionally, your neighborhood outline).
- A **list** of sales showing the address and what each person is selling.
- A **search box** that filters the map and the list at the same time.
- **Day checkboxes** that appear only for weekend (multi-day) sales.

Most of the setup is point-and-click and takes about 20 to 30 minutes. No coding
is needed until the very last step, where you paste a short snippet into your
website. If you use WordPress, that's a "Custom HTML" block, and you can hand
that part to whoever manages your site if you'd rather not do it yourself.

---

## The short version of how it works

You make a Google Form. Its answers collect in a Google Sheet. A small helper
(installed once) looks up the map location for each address. Your website reads
that sheet and draws the map and list. Once it's set up, everything updates on
its own as neighbors submit the form.

---

## Setup

### Step 1: Make the Google Form

Create a Google Form with questions for:

- The **address** of the sale (a "short answer" question). make sure to ask for the full address
- **What they're selling.** A "checkboxes" question works nicely, so people can
  tick several categories.
- (Optional) A **cancel** option, like a checkbox that says "Check here if you
  need to cancel." Anyone who checks it is hidden from the map.
- (Only for multiple days like a weekend sale) A **which day** question, like "What day(s) will you
  participate?" with choices such as Saturday, Sunday, Both, and Neither.

Keep a copy of the exact wording of each question. You'll need to type these
exactly the same way later, so it helps to copy and paste them.

### Step 2: Connect the form to a spreadsheet

In your form, click the **Responses** tab, then choose to link it to a Google
Sheet. Google creates a spreadsheet with a tab called **Form Responses 1**.
Leave that tab's name exactly as it is.

### Step 3: Add the location helper

A map needs to know where each address is on the globe. A short helper script
figures that out automatically for every new submission. You install it once.

1. In your new spreadsheet, click **Extensions → Apps Script**. A code editor opens.
2. Delete anything that's in there, then paste in the helper from
   [`sheet/sheet-app-script.ts`](./sheet/sheet-app-script.ts).
3. Near the top you'll see this line. Change the text in quotes to match your
   form's address question, word for word:

   ```js
   const ADDRESS_COLUMN_HEADER = "Yard Sale Address";
   ```

4. Set it to run automatically on each submission: click the **clock icon
   (Triggers)** on the left, then **Add Trigger**. Choose the function
   `onFormSubmit`, set the event to **On form submit**, and save. Google will ask
   for permission the first time, which is expected; approve it.

That's it. From now on, each new submission gets its map location filled in
automatically. (Submissions made *before* you installed this won't have a
location yet. To fix an old one, just submit it again.)

### Step 4: Let your website read the sheet

Your website needs permission to read the responses. This takes two small tasks.

**4a. Share the sheet so it can be read.**
In the spreadsheet, click **Share → General access**, and set it to **Anyone with
the link → Viewer**. This only exposes the answers your form already collects.

**4b. Get a key, and lock it to your site.**
A "key" is a short code your website uses to ask Google for the sheet's contents.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and sign
   in. Create a project if it asks (any name is fine).
2. Turn on the **Google Sheets API** for that project (search for it and click
   Enable).
3. Go to **Credentials → Create credentials → API key**. Copy the key it gives
   you and keep it handy for the last step.

Now lock the key down. The key will be visible in your website's code, which is
normal, but you want to make sure it only works *on your site* and only *for
reading spreadsheets*, so nobody can copy it and use it for anything else. Think
of it like a key that only opens one door, and only from your porch.

Click your new key to edit it, and set these two things:

- **Where it can be used:** under **Application restrictions**, choose **Websites**
  (also labeled "HTTP referrers"), and add your website's address, like
  `yourneighborhood.org`.
- **What it can do:** under **API restrictions**, choose **Restrict key**, and
  pick **Google Sheets API** from the list.

Click **Save**. You're done with Google.

### Step 5 (optional): Outline your neighborhood

If you'd like your neighborhood's outline drawn on the map, you'll need a map-shape
file (a `.geojson` file). Upload it somewhere your site can reach it (your media
library works), and you'll point to it in the next step with `boundsUrls`. If you
don't have one, skip this; the map works fine without it.

---

## Step 6: Add it to your website

This is the one step that involves pasting code. On the page where you want the
map (in WordPress, add a **Custom HTML** block), paste the following and fill in
the parts in CAPITAL LETTERS with your own details.

Keep the two `<script>` blocks in this order: the first one loads the map program,
and the second one hands it your details.

```html
<!-- Loads the map program -->
<script src="https://cdn.jsdelivr.net/gh/sparkstonepdx/yardsale-map@v1.0.0/dist/yardsale.min.js"></script>

<!-- Your details -->
<script>
  configureYardSale({
    spreadsheetUrl: "PASTE_YOUR_GOOGLE_SHEET_LINK_HERE",
    apiKey: "PASTE_YOUR_KEY_HERE",
    columns: {
      address: "Yard Sale Address",
      sellingList: [
        "What can people expect to find (Check all that apply)",
        "Anything else you would like to add to your sale?",
      ],
      cancelled: "Check here if you need to cancel",
    },
    accentColor: "#009879",
  });
</script>

<!-- The map, list, and search box. Put these wherever you want them. -->
<yard-sale-search></yard-sale-search>
<yard-sale-map></yard-sale-map>
<yard-sale-table></yard-sale-table>
```

A few notes:

- The text inside `columns` must match your form questions **exactly**. Copying
  and pasting from the sheet's top row is the safest way.
- The colors and controls come styled already; there's no separate style file to add.
- The map, list, and search box can go anywhere on the page, in any order.

---

## Settings you can change

Everything below goes inside the `configureYardSale({ ... })` block from Step 6.
Only `spreadsheetUrl`, `apiKey`, and `columns.address` are truly required.

| Setting | Example | What it does |
| --- | --- | --- |
| `spreadsheetUrl` | `"https://docs.google.com/…"` | The link to your Google Sheet. |
| `apiKey` | `"AIza…"` | The key from Step 4b. |
| `columns.address` | `"Yard Sale Address"` | Your form's address question. |
| `columns.sellingList` | `["What can people…"]` | One or more questions listing what's for sale. |
| `columns.cancelled` | `"Check here if you need to cancel"` | A question that hides a sale when answered. |
| `columns.day` | `"What day(s)…"` | The which-day question (weekend sales only). |
| `scheduleMap` | see below | Turns each day answer into a day (weekend sales only). |
| `eventDates` | `{ sat: "2026-09-19" }` | The actual date of each day (weekend sales only). |
| `timezone` | `"America/Los_Angeles"` | Your local time zone, so "Today"/"Tomorrow" are correct. |
| `boundsUrls` | `["https://…/area.geojson"]` | Neighborhood outline file(s) from Step 5. |
| `accentColor` | `"#7c3aed"` | The main color, used on the header, buttons, and outline. |

---

## Weekend (two-day) sales

For a one-day sale, ignore the day settings entirely. The day checkboxes won't
appear, and the list simply shows the address and what's for sale.

For a weekend, you connect three settings so the map understands the schedule:

- `columns.day` is your which-day question.
- `scheduleMap` translates each possible answer into short day labels. An empty
  list `[]` means "not participating," which hides the sale (this is how the
  "Neither" option cancels).
- `eventDates` gives each label a real date, so the map can show "Saturday" or,
  as the weekend nears, "Today" and "Tomorrow."

```js
configureYardSale({
  spreadsheetUrl: "PASTE_YOUR_GOOGLE_SHEET_LINK_HERE",
  apiKey: "PASTE_YOUR_KEY_HERE",
  columns: {
    address: "Yard Sale Address",
    sellingList: ["What can people expect to find (Check all that apply)"],
    day: "What day(s) do you plan to participate in the yard sale?",
  },
  scheduleMap: {
    "Saturday, September 19, 2026 (9:00 a.m. to 3:00 p.m.)": ["sat"],
    "Sunday, September 20, 2026 (9:00 a.m. to 3:00 p.m.)": ["sun"],
    "Both days, Sept 19 and Sept 20 (9:00 a.m. to 3:00 p.m.)": ["sat", "sun"],
    "Neither (if you need to cancel)": [],
  },
  eventDates: { sat: "2026-09-19", sun: "2026-09-20" },
  timezone: "America/Los_Angeles",
});
```

With this set up, day checkboxes appear (all checked to start). Unchecking a day
hides sales that only happen that day, and the list gains a column showing each
sale's day(s).

---

## If something's not working

- **No sales appear at all.** Double-check that the sheet is shared "Anyone with
  the link → Viewer," that you turned on the Google Sheets API for your key, and
  that the responses tab is still named "Form Responses 1."
- **The list shows sales, but there are no pins on the map.** Those rows don't
  have a location yet. Make sure the Step 3 helper is installed, then re-submit
  the affected entries.
- **A column comes up empty.** The wording in your settings doesn't match the
  form question exactly. Copy it straight from the top row of the sheet.
- **Nothing shows up, and a tech-savvy friend sees "configureYardSale is not
  defined" in the browser console.** The two script blocks are in the wrong
  order. The one that loads the program must come first.

---

## For whoever hosts the file

The `<script src>` above points at jsDelivr, a free service that serves files
from a GitHub release. Pin an exact version (like `@v1.0.0`) rather than a moving
target like `@main`, because jsDelivr caches files and a fixed version keeps
things predictable. If you publish to npm instead, the address is
`https://cdn.jsdelivr.net/npm/yardsale-map@1/dist/yardsale.min.js`.

---

## License

Yard Sale Map is free software, released under the **GNU General Public License,
version 3 or later (GPLv3+)**. See [license](./license) for the full text. You're
free to use, study, share, and modify it; distributed changes must stay under the
GPL.

Copyright (C) 2026 Sparkstone LLC.

As the copyright holder, Sparkstone LLC also makes this software available under
separate commercial terms for anyone who would rather not use it under the GPL.
Contact Sparkstone for details.

See [contributing.md](./contributing.md) if you'd like to contribute.
