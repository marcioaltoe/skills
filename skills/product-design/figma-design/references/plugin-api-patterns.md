# Figma Plugin API Patterns for `use_figma`

Exact code patterns for the JavaScript passed to `use_figma.code`. Copy these patterns — do not improvise equivalents.

## 1. Discovering Library Assets Inside the Script

`search_design_system` (MCP tool) is the preferred discovery path — call it BEFORE writing the script. Inside the script, two secondary paths exist:

```js
// Variables from connected libraries
const libCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
// Each entry has { key, name, libraryName } — use key with importVariableByKeyAsync.

// Components from connected libraries
const libComponents = await figma.teamLibrary.getAvailableLibraryComponentsAsync(libraryFileKey);
// Each entry has { key, name, containingFrame } — use key with importComponentByKeyAsync.
```

**Important:** `figma.variables.getLocalVariableCollectionsAsync()` only returns variables defined LOCALLY in the current file. It returns `[]` for imported library variables. Never use an empty local result as proof a token is missing.

## 2. Importing and Instantiating Components

```js
// Single component
const button = await figma.importComponentByKeyAsync("abcdef1234567890");
const buttonInstance = button.createInstance();
figma.currentPage.appendChild(buttonInstance);

// Component set (variants)
const buttonSet = await figma.importComponentSetByKeyAsync("fedcba0987654321");
const primaryButton = buttonSet.defaultVariant.createInstance();
figma.currentPage.appendChild(primaryButton);

// To pick a specific variant instead of the default:
const largeDestructive = buttonSet.children.find(
  c => c.type === "COMPONENT" && c.name === "Variant=Destructive, Size=lg"
);
const instance = largeDestructive.createInstance();
```

**Rules:**

- `setProperties` only works on `InstanceNode`. Remote components (from libraries) are read-only ComponentNodes.
- Always append the instance to a parent (`figma.currentPage.appendChild` or `parentFrame.appendChild`) — orphaned instances will not render.
- Never rebuild a library component from primitives (`createRectangle`, `createText`, `createVector`). If the import fails, escalate to the user per the SKILL.md error handling.

## 3. Setting Component Properties

```js
// Read the exact property keys from the instance first
console.log(instance.componentPropertyDefinitions);
// {
//   "Size":              { type: 'VARIANT',       defaultValue: 'md', variantOptions: ['sm','md','lg'] },
//   "Variant":           { type: 'VARIANT',       defaultValue: 'Default', variantOptions: [...] },
//   "HasIcon#12:0":      { type: 'BOOLEAN',       defaultValue: false },
//   "Label#12:1":        { type: 'TEXT',          defaultValue: 'Button' },
//   "IconSwap#12:2":     { type: 'INSTANCE_SWAP', defaultValue: '...' }
// }

instance.setProperties({
  Size: "lg", // VARIANT — bare name
  Variant: "Destructive", // VARIANT — bare name
  "HasIcon#12:0": true, // BOOLEAN — #id suffix required
  "Label#12:1": "Delete", // TEXT — #id suffix required
  "IconSwap#12:2": iconNode.id, // INSTANCE_SWAP — #id suffix required
});
```

**Common errors:**

- Passing a VARIANT name with its suffix → rejected. Use bare name.
- Omitting the `#id` suffix on BOOLEAN/TEXT/INSTANCE_SWAP → rejected.
- Calling `setProperties` on a `ComponentNode` → does not exist. Instantiate first.

## 4. Binding Variables to Paints

Paints are immutable — you must clone, modify, reassign.

```js
const bgColor = await figma.variables.importVariableByKeyAsync(bgKey);

// For any node with fills (frame, rectangle, text, etc.)
const fillsCopy = [...node.fills]; // clone the readonly array
fillsCopy[0] = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 1 }, // placeholder color IS required but ignored
  "color",
  bgColor
);
node.fills = fillsCopy; // reassign

// Same pattern for strokes
const strokesCopy = [...node.strokes];
strokesCopy[0] = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
  "color",
  borderColor
);
node.strokes = strokesCopy;
```

## 5. Binding Variables to Numeric Fields

```js
const space16 = await figma.variables.importVariableByKeyAsync(space16Key);
const radiusLg = await figma.variables.importVariableByKeyAsync(radiusLgKey);

// Simple field binding — pass the Variable object, not the id
node.setBoundVariable("paddingLeft", space16);
node.setBoundVariable("paddingRight", space16);
node.setBoundVariable("paddingTop", space16);
node.setBoundVariable("paddingBottom", space16);
node.setBoundVariable("itemSpacing", space16);
node.setBoundVariable("cornerRadius", radiusLg);
node.setBoundVariable("strokeWeight", borderWidth);
node.setBoundVariable("width", fixedWidth);
node.setBoundVariable("height", fixedHeight);
```

**Available bindable fields** (frame/component): `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`, `itemSpacing`, `counterAxisSpacing`, `cornerRadius`, `topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius`, `strokeWeight`, `strokeTopWeight`, `strokeRightWeight`, `strokeBottomWeight`, `strokeLeftWeight`, `opacity`, `visible`, `characters` (text), `fontFamily` (text), `fontStyle` (text), `fontSize` (text), `lineHeight` (text), `letterSpacing` (text), `paragraphSpacing` (text), `paragraphIndent` (text).

## 6. Creating Auto-Layout Frames

```js
const frame = figma.createFrame();
frame.name = "CardStat";

// ORDER MATTERS — set layoutMode BEFORE padding/spacing/alignment
frame.layoutMode = "VERTICAL"; // 'HORIZONTAL' | 'VERTICAL' | 'GRID' | 'NONE'

// Modern sizing API — prefer over legacy primaryAxisSizingMode/counterAxisSizingMode
frame.layoutSizingHorizontal = "FILL"; // 'FIXED' | 'HUG' | 'FILL'
frame.layoutSizingVertical = "HUG";

// Alignment
frame.primaryAxisAlignItems = "MIN"; // 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'
frame.counterAxisAlignItems = "CENTER"; // 'MIN' | 'CENTER' | 'MAX' | 'BASELINE'

// Spacing and padding — bind to variables per Section 5
frame.itemSpacing = 16; // replace with setBoundVariable when possible
frame.paddingTop = 24;
frame.paddingBottom = 24;
frame.paddingLeft = 24;
frame.paddingRight = 24;

figma.currentPage.appendChild(frame);
```

**Grid layout:**

```js
frame.layoutMode = "GRID";
frame.gridRowCount = 3;
frame.gridColumnCount = 2;
frame.gridRowGap = 16;
frame.gridColumnGap = 16;
// Children are placed into grid cells automatically by append order.
```

**Absolute positioning inside auto-layout** (for badges, overlays, decorative elements):

```js
badge.layoutPositioning = "ABSOLUTE";
badge.x = parent.width - badge.width - 8;
badge.y = 8;
parent.clipsContent = false; // if badge extends past parent bounds
```

## 7. Creating Text

```js
const text = figma.createText();

// MUST load the font BEFORE setting characters
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
text.fontName = { family: "Inter", style: "Semi Bold" };
text.characters = "Total revenue";

// Prefer a shared text style over raw overrides
const bodyStyle = (await figma.getLocalTextStylesAsync()).find(s => s.name === "Body/MD");
if (bodyStyle) {
  await text.setTextStyleIdAsync(bodyStyle.id);
}

// For mixed-font text nodes (e.g. updating existing copy):
const fonts = text.getRangeAllFontNames(0, text.characters.length);
await Promise.all(fonts.map(f => figma.loadFontAsync(f)));
text.characters = "New copy";
```

**Font name gotchas:** Inter uses `'Semi Bold'` and `'Extra Bold'` with a space — not `'SemiBold'` / `'ExtraBold'`. Check exact casing with `figma.listAvailableFontsAsync()` if unsure.

## 8. Current Page Navigation

```js
// WRONG — not supported
figma.currentPage = somePage;

// RIGHT
await figma.setCurrentPageAsync(somePage);
```

## 9. Creating a New Page

```js
const page = figma.createPage();
page.name = "Onboarding Flow";
await figma.setCurrentPageAsync(page);
```

## 10. Appending and Ordering

```js
// Append to end
parent.appendChild(child);

// Insert at a specific index
parent.insertChild(0, child); // prepend

// Reorder within siblings
parent.insertChild(parent.children.indexOf(child), child);
```

## Error Handling Reference

| Error                                                      | Cause                                                     | Fix                                                      |
| ---------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| `In order to set this property, please call loadFontAsync` | Font not loaded before setting `characters` or `fontName` | Call `await figma.loadFontAsync(text.fontName)` first    |
| `Cannot assign to read only property 'fills'`              | Mutating readonly array in-place                          | Clone with `[...node.fills]`, modify, reassign           |
| `setProperties is not a function`                          | Called on ComponentNode instead of InstanceNode           | Call `createInstance()` first                            |
| `Property not found: 'Label'`                              | Missing `#id` suffix on BOOLEAN/TEXT/INSTANCE_SWAP        | Read `componentPropertyDefinitions` for exact key        |
| `Invalid variant: ...`                                     | Passed a variant value not in `variantOptions`            | Log `componentPropertyDefinitions` to see allowed values |
| `Variable does not belong to a collection in this file`    | Variable not imported via `importVariableByKeyAsync`      | Import the variable first, then bind                     |
| `Cannot set layoutMode on this node type`                  | Node is not a FrameNode/ComponentNode/InstanceNode        | Wrap in a Frame first                                    |
| `paddingLeft has no effect`                                | `layoutMode` is `NONE`                                    | Set `layoutMode` to HORIZONTAL/VERTICAL/GRID first       |
| `figma.currentPage is read-only`                           | Using assignment instead of `setCurrentPageAsync`         | Use `await figma.setCurrentPageAsync(page)`              |
