WearWise — Complete Page Specification

Theme & Design Language
The overall feel should be clean, minimal, and quietly premium. Think of British fashion retailers like Cos, Reiss, or & Other Stories — not loud or colourful, but confident and refined. Everything should feel considered, never cluttered.
Colours — Off-white background (#F9F8F6), near-black text (#1C1C1A), and a single accent colour of muted sage green (#4A7C59) used only for primary buttons, active states, and links. No other accent colours anywhere. Error states use a muted terracotta red, success states use a soft green, both desaturated — never the garish traffic-light colours you see on cheap sites.
Typography — Plus Jakarta Sans from Google Fonts, loaded in two weights only: 400 for body text and 500 for headings and labels. Never bold (700). Never italic unless it is a deliberate editorial moment. Font sizes are 13px for small labels, 15px for body, 18px for section headings, and 28–36px for hero headings. Generous line height of 1.7 throughout.
Spacing — Everything breathes. Minimum 24px padding inside any card or section. 48px between major sections on a page. The layout should feel like a well-designed magazine, not a marketplace.
Cards — Flat white cards with a single 0.5px border in a very light grey. No drop shadows anywhere on the site. Hover states on cards show a slightly darker border, nothing more.
Buttons — Primary button is sage green background with white text, 14px, 40px tall, slightly rounded corners. Secondary button is transparent with a sage green border and sage green text. Destructive actions (delete, cancel) use the muted terracotta outline button. No button should ever be loud or oversized.
Navigation — Fixed top header, white background, 64px tall. Logo sits left in a clean wordmark style. Centre navigation links: Browse, AI Assistant, My Wardrobe (hidden if guest). Right side: cart icon with item count badge, and either a "Sign in" text link or a small circular avatar with the user's initial if logged in. On mobile, navigation collapses into a slide-in drawer from the left.
Forms — All inputs are 40px tall, full border, no floating labels. Labels sit above the input in 13px muted text. Focus state shows a sage green border. Placeholder text is very light grey. Error messages appear below the field in small terracotta text — never inside the field.
Modals — Centred overlay with a darkened backdrop. The modal itself is a white card, max 480px wide, with a close button top-right. No animation except a simple 150ms fade in. Used only for login prompts and confirmations, never for complex flows.
Loading states — Skeleton screens, never spinners. When a page is loading its data, grey placeholder blocks appear in the shape of the content. This feels more premium than a spinning circle.
Empty states — Every page that can be empty (no orders, empty wardrobe, no search results) has a dedicated empty state: a short heading, one sentence of explanation, and a single action button. Never just a blank page.
Toast notifications — Small pill-shaped notifications that slide in from the top-right corner and auto-dismiss after 3 seconds. Used for success confirmations like "Added to cart" or "Profile updated." Errors stay on screen until dismissed.

Public Pages (No Login Required)

Page 1 — Home Page
Purpose: The first impression of WearWise. It needs to communicate what the platform does within three seconds and push the visitor towards either the AI assistant or the store.
Header — The standard site header appears here. For guests, the right side shows a "Sign in" link and a "Register" button in sage green. For logged-in users, their initial avatar appears with a dropdown containing My Wardrobe, Order History, Profile, and Sign Out.
Hero section — Full-width section, roughly 500px tall. Left side contains a large heading: "Dress for the day, every day." Below that, a single line of supporting text: "Tell us where you're going and we'll tell you what to wear." Below that, a single input field styled like a chat prompt with placeholder text "I have a job interview tomorrow…" and a sage green arrow button to the right. Pressing enter or clicking the arrow takes them directly to the AI Assistant page with their typed message pre-loaded into the chat. Right side of the hero shows a clean editorial photograph — a styled flat-lay of an outfit, not a model. Static image, no carousel.
Occasion quick-picks — Below the hero, a horizontal row of five pill-shaped buttons: Work, Casual, Date Night, Gym, and Smart Casual. Clicking any of these goes straight to the AI Assistant page with that occasion pre-selected as the opening context. No heading above these pills, they speak for themselves.
Featured products section — A heading "New In" in 18px with a "View all" link aligned right. Below it, a four-column grid of product cards. Each card shows the product image (square crop), product name, price, and a small occasion tag beneath. No "Add to Cart" button on this grid — clicking the card goes to the product detail page. The grid should show the four most recently added products from the database.
How it works section — Three columns, each with a small numeral (01, 02, 03), a short heading, and two lines of text. 01: "Tell us your plans" — describe your day or occasion in plain English. 02: "We check the weather" — we factor in today's forecast automatically. 03: "Get your outfit" — receive suggestions from your wardrobe or our store. Clean, no icons, no illustrations.
Footer — Four columns: About WearWise, Shop (links to Browse, New In, Sale), Help (FAQ, Returns, Contact), and Account (Login, Register). Below the columns, a single line with copyright text and two links: Privacy Policy and Terms of Use. Sage green logo mark, everything else in muted grey text.
Edge cases:

If the user types in the hero input and presses enter, the text must transfer correctly to the chat on the AI Assistant page even if the chat has not yet loaded. Store the value in a URL query parameter like ?q=I+have+a+job+interview and the AI page reads it on mount.
On mobile the hero becomes single column — image hides, only the text and input remain.
The featured products grid falls to two columns on tablet and one column on mobile.
If the database has fewer than four products, the grid shows however many exist without breaking layout.
Logged-in users see the header avatar but the hero and content are identical — there is no separate version of this page for logged-in users.


Page 2 — Browse Store
Purpose: The main shopping page. Users can explore the full product catalogue and filter it down to what they need.
Page header area — Below the site header, a simple page title "Shop" in 28px and a product count in muted text: "142 items" updating dynamically as filters are applied.
Layout — Two-panel layout. Left panel is a 260px wide filter sidebar. Right panel is the scrollable product grid.
Filter sidebar — The sidebar has no heading. Filters are grouped by section, each with a thin dividing line between them. Section one is Category: checkboxes for Tops, Trousers, Dresses, Outerwear, Footwear, Accessories. Section two is Occasion: checkboxes for Work, Casual, Date Night, Gym, Smart Casual, Weekend. Section three is Price with a dual-handle range slider showing values from £0 to £500 with the current range shown numerically above the slider. Section four is Colour with small filled circles (12px, no label) representing available colours — clicking one filters by that colour, and it gains a checkmark overlay when selected. Section five is Availability with a single toggle: "In stock only." At the bottom of the sidebar, a "Clear all filters" text link in sage green.
Product grid — Three columns on desktop, two on tablet. Each product card is: square image top (aspect ratio enforced, image covers the space), product name in 14px medium below, price in 15px below that, and a small occasion pill tag. On hover, a secondary image swaps in (if one exists) using a CSS crossfade — this is a standard fashion site pattern. No other hover state.
Sort control — Above the grid, right-aligned: a simple dropdown select input. Options are: Newest, Price: Low to High, Price: High to Low, Most Popular. Default is Newest.
Search — A search bar sits above the filter sidebar spanning the full width of the left panel. As the user types, results update in the grid after a 300ms debounce. Searching clears active filters and shows a results count: "12 results for 'grey coat'."
Pagination — At the bottom of the grid, numbered page links. Show 24 products per page. If fewer than 24 results exist, no pagination appears.
Edge cases:

If filters return zero results, the grid area shows the empty state: "No items match your filters." with a "Clear filters" button.
If search returns zero results: "We couldn't find anything for 'term'." with a suggested alternative to browse by category.
The filter sidebar on mobile becomes a slide-up drawer triggered by a "Filter & Sort" button pinned to the bottom of the screen.
URL should update with filter parameters so the page is shareable and bookmarkable. Example: /browse?category=tops&occasion=work&maxPrice=150
Filter counts in brackets next to each option showing how many products match: "Tops (34)". These counts update as other filters are applied so the user knows what combinations have results.
If a product sells out while the user is browsing, it should either disappear from results or show "Sold out" — this depends on whether you want to keep it visible. For FMP, show it with a "Sold out" overlay and prevent adding to cart.


Page 3 — Product Detail Page
Purpose: Give the user everything they need to make a purchase decision and nudge them towards adding to cart.
Breadcrumb — Small text above the product: "Shop / Outerwear / Slim Wool Coat" — each segment is a link. 13px, muted grey.
Two-column layout — Left column is images, right column is all product information.
Image panel (left) — A large primary image at the top, roughly square. Below it, a horizontal row of thumbnail images (maximum five). Clicking a thumbnail swaps the main image. If the screen is wide enough, the image panel sticks while the user scrolls the right column — standard e-commerce pattern.
Product information (right) — Product name in 24px. Price in 20px sage green. If there is a sale price, show the original crossed out in grey beside it. Below the price, a short one-paragraph description of the product — material, fit, and style notes, written in a concise British editorial tone. Below that, an occasion tag row — small pills showing which occasions the item suits. Below that, a colour selector if multiple colours exist: small circles the same as in the filter. Below that, a size selector — a row of pill buttons for each available size (XS, S, M, L, XL). Clicking a size selects it and shows a stock indicator: "Only 2 left" if stock is below 5, or nothing at all if stock is healthy (never show "12 in stock" — that is not how premium retailers communicate). Below the size selector, the main Add to Cart button, full width of the right column, sage green. Below the button, a small text line: "Free delivery on orders over £50."
AI weather tip — A subtle, bordered card below the product description. A small leaf icon (SVG, not emoji) on the left, and text like: "Good for today — it's 11°C and overcast in your area. Layer with a knit underneath." This is generated server-side when the page loads using the weather API and the product's metadata (category, weight, season tags). If the weather API fails, this card simply does not appear. It never shows an error.
Complete the outfit section — Below the two-column layout, a heading "Wear it with" and a four-item horizontal scroll of complementary product cards. These are selected by matching occasion tags and category rules (e.g. if viewing a coat, suggest trousers, a knit, and footwear — never suggest another coat). For FMP this can be a simple rule-based query rather than AI.
Reviews section — A static section at the bottom. For FMP, seed the database with three to five realistic-looking reviews per product. Show star rating (rendered as SVG stars, not emoji), reviewer name (first name and last initial only), date, and review text. A summary line at the top shows average rating and total count.
Edge cases:

If a guest clicks Add to Cart, a modal appears: "Sign in to add items to your bag." with Sign In and Register buttons. The modal remembers which product and size they chose so it auto-adds after login — store the pending cart item in localStorage before redirecting.
If no size is selected and the user clicks Add to Cart, the size selector shakes (CSS animation) and a message appears beneath it: "Please select a size."
If the selected size is out of stock, the Add to Cart button becomes "Notify me when back" — clicking this for a logged-in user saves the notification request. For guests, it prompts login.
If the product has only one colour, the colour selector does not appear.
If there are fewer than four products to show in "Wear it with," show however many there are without breaking the layout.
If the weather API returns no data or times out after 2 seconds, the AI weather tip card is silently omitted.
Images that fail to load show a tasteful grey placeholder with the WearWise logo mark centred inside.


Page 4 — AI Outfit Assistant
Purpose: The heart of WearWise. A clean, conversational interface that suggests outfits based on weather, occasion, and personal context.
Layout — Single centred column, max-width 680px, vertically centred on the screen. No sidebar, no distractions. The site header remains at the top but everything else is the chat interface.
Opening state (no messages yet) — A short heading centred in the middle of the page: "What are you dressing for?" Below it, four suggestion pills: "A job interview," "A dinner date," "A casual weekend," "The gym." Clicking a pill pre-fills it as the user's first message. Below the pills, the chat input field pinned to the bottom of the centred column.
Chat input — A full-width rounded input field with a sage green send button on the right. Placeholder text: "Describe your plans or occasion…" On mobile, when the keyboard opens, the input lifts with it and the chat scrolls up correctly.
Message bubbles — User messages appear on the right in a sage green bubble, white text. Assistant messages appear on the left with no bubble — just clean text on the white background with a small "W" avatar representing WearWise. The assistant's text is in the standard body font, not monospaced, not styled differently. It reads like a knowledgeable friend talking to you.
Background context (invisible to user) — When the chat initialises, the frontend calls a Next.js API route which fetches the current weather for the user's saved location (or IP-based location for guests), formats it, and includes it in the system prompt sent to the AI. The user never sees this. The prompt instructs the AI to be concise, British in tone, confident, and to avoid asking more than one clarifying question before giving a recommendation.
Outfit response card — When the AI recommends specific items from the store, those items are returned as structured data embedded in the response (the AI is instructed to return item IDs alongside its text). The frontend renders these as horizontal product cards inline in the conversation. Each card shows a small product thumbnail on the left, product name, price, occasion tags, and an Add to Cart button. The card sits between the AI's text paragraphs naturally, as if the assistant has handed you a selection to look at.
Logged-in user context — If the user is logged in, their saved style preferences, sizes, and wardrobe items are included in the system prompt. The AI can say "You already have a navy coat in your wardrobe — pair it with these slim trousers from our store." This is what makes the logged-in experience genuinely valuable.
Guest limitations — Guests get full AI responses and outfit suggestions. Their conversation is not saved when they close the page or navigate away. A subtle message appears at the top of the chat after the first response: "Sign in to save your outfit suggestions." as a soft nudge — not a modal, not an interruption, just a small dismissable banner.
Chat history (logged in) — A thin left sidebar (200px) showing previous chat sessions as short titles generated from the first message. Clicking one loads that conversation. A "New chat" button sits at the top of this sidebar. On mobile, the history is hidden and accessible via a history icon in the header.
Edge cases:

If the AI API call fails, show an inline error message in the assistant position: "Something went wrong — please try again." with a Retry button. Never show a raw error message.
If the weather API fails, the AI still works but without weather context. The AI is instructed that if it has no weather data it should ask the user "Are you dressing for warm or cold weather?" as its opening question rather than making assumptions.
If a guest has a very long conversation (say 20 messages) and then tries to add a product to cart, the login modal appears. After login they are returned to the chat — but the conversation history is gone since it was not saved. A message in the returned-to-empty chat reads: "Welcome back. Start a new conversation to get outfit ideas."
The input field should prevent sending an empty message. The send button is disabled until at least one character is typed.
Very long AI responses should be streamed in token by token so the user sees the text appearing progressively rather than waiting for the full response. This is handled by using the streaming API endpoint.
If the user's location is not set (new guest or profile location is empty), use the browser's Geolocation API with a permission prompt. If the user denies, the weather tip is skipped and the AI asks about temperature preference directly.
Rate limit the API calls per session to prevent abuse — for FMP, a simple server-side counter per IP in Redis or even just a session variable limiting to 20 messages per hour is sufficient.


Customer Pages (Login Required)

Page 5 — My Wardrobe
Purpose: Allow users to catalogue their existing clothing so the AI can reference it when making suggestions.
Page header — Below the site header, a page title "My Wardrobe" and a subtitle in muted text: "The AI uses your wardrobe to give personalised outfit suggestions."
Upload area — A prominent dashed-border upload zone at the top of the page. Inside it, text reads: "Drop a photo here, or click to browse." Accepts JPG and PNG up to 5MB. On mobile this becomes a camera/gallery picker. Images are uploaded to Cloudinary on selection and a thumbnail preview appears immediately before the user fills in the item details.
Item tagging modal — After an image is uploaded, a modal appears with the image preview on the left and a small form on the right: Category (dropdown — Tops, Trousers, Dresses, Outerwear, Footwear, Accessories), Colour (text input with a colour picker), Occasions (multi-select checkboxes — the same five occasions used throughout the site), and Season (multi-select — Spring/Summer, Autumn/Winter, All year). A Save button confirms and adds the item to their wardrobe. A Skip button saves the image with no tags — the item will not be used by the AI until tagged.
Wardrobe grid — Below the upload area, a grid of wardrobe items (four columns desktop, two mobile). Each card shows the item image, its category label, and its occasion tags as small pills. On hover, an Edit button (pencil icon) and a Delete button (bin icon) appear as a small overlay bar at the bottom of the image. No other hover state.
Filter tabs — Above the grid, a row of tab filters: All, Tops, Trousers, Dresses, Outerwear, Footwear, Accessories. Clicking a tab filters the grid instantly without a page reload.
AI usage indicator — A small informational banner at the top of the grid, dismissable: "Items without occasion tags won't be suggested by the AI." with an "Add tags" link that highlights untagged items.
Edge cases:

If the wardrobe is empty, the empty state shows the upload zone as the main call to action with text: "Add your first item and the AI will start building outfit suggestions around what you already own."
If the uploaded file is not an image or exceeds 5MB, show an inline error below the upload zone: "Please upload a JPG or PNG image under 5MB."
If Cloudinary upload fails, show a toast notification: "Upload failed — please try again." The modal closes and the image is not saved.
Deleting an item shows a confirmation: "Remove this item from your wardrobe?" with Cancel and Remove buttons. The AI will no longer reference it after deletion.
If the user has more than 50 items, add a "Load more" button rather than showing everything at once — this prevents the page from becoming slow with many images.
Untagged items appear in the grid but with a subtle grey overlay and a small "Add tags" badge to make them visually distinct from tagged items.


Page 6 — Cart
Purpose: Review selected items before purchasing.
Layout — Two-column. Left column (wider) is the cart items list. Right column (narrower, sticky on scroll) is the order summary.
Cart items list — Each item in the cart is a horizontal row: thumbnail image on the left (80px square), product name and selected size/colour in the middle, price on the right, and a quantity selector (minus, number, plus buttons in a small pill) below the price, and a Remove text link below the quantity selector. A thin dividing line separates each item.
Order summary panel — Subtotal, delivery cost (free if over £50, otherwise £3.99), and total in larger text. A promotional code field with an Apply button beneath the subtotal. The checkout button is the full-width sage green button. Below it in small muted text: "Free returns within 28 days."
AI upsell strip — Below the cart items list and above the order summary, a horizontal scroll row labelled "Complete your order" in 13px muted text. This shows two or three items that complement what is already in the cart, generated by matching occasion and category rules. Each item has a small thumbnail, name, price, and a plus icon to add it directly from here.
Edge cases:

If the cart is empty, show the empty state: "Your bag is empty." with a "Continue shopping" button linking to Browse.
If an item goes out of stock while it is in the cart (between session start and checkout), it appears greyed out with a "No longer available" message and cannot be checked out. A toast notification appears: "One item in your bag is no longer available."
If a size sells out between adding to cart and checkout, show the same out-of-stock state on that specific item.
Quantity cannot go below 1 — the minus button becomes disabled at 1. To remove an item the user must click Remove.
The promo code field shows "Code applied — 10% off" in sage green if valid, or "Code not recognised" in terracotta if invalid.
Cart contents persist in the database for logged-in users — if they close and reopen the browser their cart is still there. For guests there is no cart (they cannot reach the cart page without logging in).


Page 7 — Checkout
Purpose: Collect delivery details and payment and confirm the order.
Layout — Single column, max-width 560px, centred. A thin progress indicator at the top showing three steps: Delivery, Payment, Confirm. Currently active step is highlighted in sage green.
Step 1 — Delivery — Full name field, address line one, address line two (optional), city, postcode, and country (defaulting to United Kingdom). If the user has a saved address in their profile it pre-fills here. A checkbox: "Save this address to my profile." A Continue button advances to step 2.
Step 2 — Payment — A Stripe card element (their hosted input, which handles card number, expiry, and CVC in a single field). Below it, a small padlock icon and text: "Payments are secure and encrypted." The billing address defaults to the delivery address with an option to enter a different one. A Place Order button. Below it, a summary of what they are paying for (item count and total) so the user does not have to scroll back.
Step 3 — Confirmation — A large checkmark (SVG, sage green), a heading "Order confirmed," the order number in muted text, and a paragraph: "We'll send a confirmation to your email address. You can track your order in Order History." A "Continue shopping" button and a "View order" button side by side.
Edge cases:

All fields on the delivery step are required except address line two. Show validation errors below each field on submit attempt.
If Stripe payment fails (declined card, network error), show an error above the Place Order button: "Your payment couldn't be processed. Please check your card details or try a different card." The order is not created.
Postcode format is validated for UK postcodes (regex pattern).
If the user navigates back from the payment step to the delivery step, their form data is preserved.
After a successful order, the cart is cleared in the database.
If the user closes the browser mid-checkout after step 1, the order is not created — only clicking Place Order and receiving a successful Stripe response creates the order record.
The confirmation page should not be reachable by directly navigating to its URL — only reachable via a completed order flow. A direct visit redirects to Order History instead.


Page 8 — Order History
Purpose: Let users see all their past orders and their current status.
Layout — Single column, max-width 720px, centred.
Order list — Each order is a card. At the top of the card: order number on the left, order date and total on the right, and a status badge (Pending, Processing, Shipped, Delivered). Below that, a horizontal row of small product thumbnails (up to four, then "+2 more" if there are more). Below the thumbnails, an "Order details" link that expands the card inline (no new page needed for FMP).
Expanded order detail — Shows a full list of items with name, size, quantity, and price per item. The delivery address used. The payment total. If the order is Shipped, a tracking reference number field (for FMP this can be a static placeholder — no live tracking integration is needed). A "Need help?" link that could go to a contact page or simply open an email link for FMP purposes.
Edge cases:

If there are no orders, show empty state: "You haven't placed any orders yet." with a "Start shopping" button.
Orders cannot be cancelled from this page in the FMP — this would require payment reversal logic. Simply omit a cancel button. You can note in your documentation that this is a future feature.
The status badge colour matches the admin panel statuses: Pending is terracotta, Processing is amber, Shipped is blue, Delivered is sage green.


Page 9 — Profile & Settings
Purpose: Let users manage their personal information and preferences that power the AI suggestions.
Layout — Single column, max-width 600px, centred. Sections are separated by full-width dividing lines.
Personal information section — Display name field, email field (read-only — show a note: "To change your email, contact support"), password change link that expands an inline form (current password, new password, confirm new password).
Location section — A single text field for their home city or town (used by the AI chatbot for weather). A short helper text beneath: "This helps the AI give weather-appropriate suggestions." A "Detect my location" link that uses the browser Geolocation API to fill in the city name automatically.
Style preferences section — A grid of style tag pills the user can toggle on and off: Minimal, Classic, Streetwear, Smart Casual, Athleisure, Boho, Preppy, Edgy. Selected ones appear in sage green, unselected in the default outlined style. These are included in the AI system prompt.
Sizes section — Three dropdowns side by side: Top size, Bottom size, Shoe size (UK sizing). These are included in AI suggestions so it never recommends something in a size the user does not wear.
Danger zone section — At the very bottom, below a dividing line and a muted heading "Account." A "Delete my account" text link in terracotta. Clicking opens a confirmation modal: "This will permanently delete your account, wardrobe, and order history. This cannot be undone." with a Cancel button and a red Delete Account button. Typing the word DELETE in a confirmation field is required before the button becomes active.
Edge cases:

The save button appears once for each section individually — not one global save at the bottom. This prevents losing all changes because of one invalid field in an unrelated section.
Style preferences auto-save on toggle with a small "Saved" toast confirmation — no save button needed for this section.
If the location field is left empty, the AI chatbot falls back to asking the user about temperature rather than fetching weather automatically.
Password change validates that the new password is at least 8 characters and that confirmation matches before allowing submission.
Account deletion should soft-delete in the database (set a deleted_at timestamp) rather than hard-deleting rows immediately — this protects order data integrity and allows potential recovery. The user's login will stop working immediately.


Admin Pages (Admin Role Required)

How Admin Access Works
There is no separate admin login page. The admin uses the same /login page as everyone else. After logging in, the system checks the role field on their user record in the database. If it is admin, the site header shows an additional "Admin" link on the far right that takes them to the admin panel. This link is invisible to all non-admin users — it is not rendered in their HTML at all, not just hidden with CSS.
Every single /admin/* route is protected by middleware that checks the session role server-side. If anyone without the admin role visits an admin URL directly, they are immediately redirected to the home page with no error message — no confirmation that an admin area even exists.
You set yourself as admin by directly updating the role column in the database during setup. There is no register-as-admin flow — this would be a security hole.

Page 10 — Admin Overview
Purpose: A quick-glance summary of the store's current state. Deliberately simple.
Layout — Standard page with the admin sub-navigation across the top: Overview (current page), Products, Orders. These three links replace the normal customer navigation when in the admin area. A small "← Back to site" link on the far right returns to the customer-facing site.
Four stat cards — A row of four cards, each the same size. Card one: "Orders today" — the count of orders placed since midnight. Card two: "Revenue this month" — total value of completed orders in the current calendar month, displayed as £X,XXX. Card three: "Low stock items" — count of products where any size has 5 or fewer units remaining, as a number. If this number is greater than zero the card border is terracotta to draw attention. Card four: "Registered users" — total user count in the database excluding the admin account.
Recent orders table — Below the stat cards, a table showing the five most recent orders. Columns: Order number, Customer name, Date, Total, Status badge. Clicking any row goes to that order's detail view in the Orders page. A "View all orders" link sits below the table aligned right.
Low stock alert list — Below the recent orders, a simple list of products that have low stock. Each row shows product name, the specific size that is low, and current stock count. A direct "Edit product" link on each row. If there are no low stock items, this section shows: "All products are well stocked." in muted text and no list.
Edge cases:

Revenue calculation only counts orders with status Delivered or Shipped — not Pending (in case it gets cancelled) and not Processing. Make this clear with a small note: "Based on shipped and delivered orders."
The stat cards should show a loading skeleton while data fetches — these numbers come from database aggregate queries which may take a moment.
If there are no orders today, the card shows "0" — never blank or a dash.
The page does not auto-refresh. A manual "Refresh" icon button sits in the top-right of the page for the admin to update the numbers.


Page 11 — Admin Product Management
Purpose: Upload new products and manage the existing catalogue.
Sub-navigation — Two tabs within this page: "All products" (default) and "Add new product."
All products tab — A table with one product per row. Columns: small thumbnail image (48px square), product name, category, price, stock status (a simple summary like "Sizes M, L in stock" or "Out of stock" in terracotta), visibility toggle (a toggle switch showing whether the product is visible to customers), and an Edit button. The table is sortable by clicking column headers — name, price, and date added. A search input above the table filters by product name.
Visibility toggle — Flipping this hides the product from the store immediately without deleting it. Useful for temporarily removing an item during a photoshoot update or a pricing change. Hidden products show a muted row background.
Edit product — Clicking Edit expands the row into an inline edit form with all fields editable. Saving updates the product in place. A Delete button at the bottom of the expanded row permanently removes the product after a confirmation modal.
Add new product tab — A clean single-column form:

Product name (text input)
Description (textarea, 4 rows tall)
Category (dropdown — Tops, Trousers, Dresses, Outerwear, Footwear, Accessories)
Occasion tags (multi-select checkboxes — Work, Casual, Date Night, Gym, Smart Casual)
Weather suitability (multi-select checkboxes — Cold, Mild, Warm, Any)
Season (multi-select — Spring/Summer, Autumn/Winter, All year)
Price (number input with £ prefix)
Sale price (number input, optional — leave blank if not on sale)
Colour name (text input) and colour hex picker
Image upload (drag and drop zone, accepts up to 6 images, first image becomes the primary)
Stock per size — a small table with rows for XS, S, M, L, XL and a number input in each row
A Publish button (makes it live immediately) and a Save as draft button (saves but keeps visibility off)

Edge cases:

All fields except sale price, season, and additional images are required. Show validation errors inline on each field.
If the admin tries to leave the Add New Product page with unsaved changes, a browser confirmation dialog warns them: "You have unsaved changes. Are you sure you want to leave?"
Image upload validates file type (JPG/PNG only) and size (max 5MB each) client-side before uploading to Cloudinary.
If any Cloudinary upload fails, show the error next to that specific image slot and allow the admin to retry — do not block saving the rest of the form.
Deleting a product that has been ordered in the past should not delete the order records — the product is soft-deleted (a deleted_at field) and historical orders still reference it correctly.
The stock number inputs only accept whole numbers and cannot go below zero.
If a product is published with zero stock in all sizes, it should automatically be marked as out-of-stock in the customer store without the admin needing to toggle visibility off.


Page 12 — Admin Order Management
Purpose: View all customer orders and update their fulfilment status.
Order list — A full-width table. Columns: Order number, Customer name (links to their profile — for FMP this can just show their email), Order date, Number of items, Total value, Status badge, and an Update status button. Default sort is newest first. Filterable by status using tab filters above the table: All, Pending, Processing, Shipped, Delivered.
Status update — Clicking "Update status" opens a small inline dropdown directly in the table row — no modal, no new page. The dropdown shows the next logical status only, not all statuses. If an order is Pending, the dropdown shows only "Mark as Processing." If Processing, only "Mark as Shipped." If Shipped, only "Mark as Delivered." This prevents accidentally setting an order backwards. After selecting, a Confirm button appears beside the dropdown. Clicking Confirm updates the status immediately and the badge updates in the table row without a page reload.
Order detail view — Clicking the order number opens a dedicated detail page (still within the admin area). This page shows: customer name and email, delivery address, list of all items with images, names, sizes, quantities, and prices, the payment total and how it was split (subtotal, delivery, any discount), the full order status history (a simple timeline — Placed on 3 April, Processed on 4 April, etc.), and a text field for an optional internal note visible only to the admin.
Edge cases:

If an order has been in Pending status for more than 48 hours, highlight its row with a subtle terracotta left border to draw the admin's attention.
The order detail page's internal note auto-saves as the admin types — a small "Saving…" indicator appears and changes to "Saved" after 1 second of inactivity.
If the admin tries to mark an order as Shipped without a tracking number field being filled (you can add an optional tracking reference field on the Shipped status update), warn them but do not block the update.
An order cannot be deleted from this panel. It can only progress through statuses. Deletion would break the customer's order history — document this as intentional.
Search above the table filters by order number or customer email for quick lookup.


Page 13 — Login & Register
Login page — Centred card, max-width 400px. WearWise logo above the card. Card contains: heading "Sign in," email input, password input, a "Forgot your password?" link below the password field (for FMP this can simply show a toast: "Please contact support to reset your password" — a full reset email flow is out of scope), and a Sign In button. Below the card: "Don't have an account? Register" as a text link.
Register page — Centred card, same width. Three steps shown as a simple numbered indicator at the top.
Step one — Account details: First name, last name, email, password, confirm password. Continue button.
Step two — Your style: A heading "What's your style?" and the same grid of style tag pills as in the profile settings. Below that, three dropdowns for sizes. A subheading "Where are you based?" and a city/town text field for location. Continue button. A "Skip for now" link that goes straight to step three — this data can be filled in later in profile settings.
Step three — Done: A large checkmark, heading "Welcome to WearWise," a short sentence "Your account is ready — start by exploring the store or chatting with the AI assistant." Two buttons: "Browse the store" and "Try the AI assistant."
Edge cases:

Email validation on both pages — check format client-side and check for existing account server-side on registration attempt.
If the email is already registered, show the error inline on the email field: "An account with this email already exists. Sign in instead?" with a link.
Password must be at least 8 characters. Confirm password must match. Show these errors inline as the user types, not only on submit.
After login, redirect the user to wherever they were trying to go before being asked to log in. If they came directly to the login page, redirect to home.
If an admin logs in, they see the same home page as any user — the admin panel link just appears in their header. No automatic redirect to the admin area.
The register form data from step one is preserved if the user navigates back from step two using the browser back button — use React state or URL state for this, not a database draft.
Rate limit login attempts — after 5 failed attempts in 10 minutes, show: "Too many attempts. Please try again in a few minutes." and block further attempts from that IP temporarily.


Summary
Thirteen pages total. Every page has a clear job. The AI assistant is the centrepiece and the only place weather logic surfaces to the user. Admin access is invisible to customers and protected at the middleware level. The design language is consistently minimal and British throughout — clean typography, generous spacing, no decoration for its own sake, and a single accent colour used sparingly. Every edge case has a graceful fallback — no blank pages, no raw errors, no broken states.