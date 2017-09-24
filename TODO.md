# Todo List

## Milestone 0.1

- ~~Text output on client (use CSS Grid)~~
- ~~Auto scroll of output box.~~ 
    - ~~hold position when scrolled up~~
    - ~~Select text when mouse click/move.~~
    - ~~Autofocus input box when clicking window with no selection action.~~
- ~~world communication~~
- ~~I don't like the message type system. Fix it.~~
    - It got better. 
- ~~Rudimentary Server-side command parser~~
- ~~Timestamps on communication messages.~~
    ~~- Show timestamp on chat messages.~~
- ~~Output user input in output panel when submitted, to make it clear where the input was received.~~
- ~~Ping command~~
- ~~One Time Render component class~~
- ~~Better connection messaging~~
    - ~~Disconnected message~~
    - ~~Cannot connect message~~
- ~~Move to React 16~~
- ~~Condense Actors and Users into the same DB entity, since they are conceptually identical.~~
- ~~Move auth system to in-memory provider. Might need to write a custom provider to do this.~~
    - ~~Load actors into memory on game load.~~
    - ~~Retain largest actor ID for new actor creation.~~
- ~~Create new Actor object for new accounts in the system.~~
    - ~~Assign starting room on new account creation.~~
- Rooms
    - ~~Show room description when entering game~~
    - ~~look command to view contents of room~~
    - ~~"Brief Look" command.~~
    - ~~Room communication, "say" command. ~~
        - ~~Default to "say" if no token parsed. ~~
    - ~~Show users in room descriptions.~~
    - ~~movement~~
    - ~~Show description upon entering room~~
- ~~Private messaging~~
- ~~Reorganize Message Components~~
- ~~Public Server~~

# Milestone 0.2 - UI update

- ~~Rename ConcerningUser to UserReference~~
    - ~~rename properties~~ 
    - ~~Move to user file~~
    - ~~Create utility method to convert user to user reference~~
    - ~~extend from actorReference?~~
- Refactor and introduce a more declarative "command" system.
    - Current design is messy, won't scale.
- "Who" list
- Command list/help.
- Look at refactoring "World" class to be cleaner. 
- Wireframe layout of the UI, figure out where to put components.
    - Input/Output area.
    - Contextual action bar 
        - room indicates react component to use.
        - IE "bank" would send "BankContextComponent", which loads a bar that allows you to quickly withdraw or deposit money. 
    - Minimap.
- Icon Badges update
    - Support arbitrary colored badges
    - Support placement of multiple badges.
    - List-based placement.
        - Starting corner
        - Flow direction
- Minimap
    - Figure out how to represent up/down links on the map. 
    - Limited A* navigation by clicking on minimap.
    - Hide rooms user has not visited.
        - Wrinkle. Storing visited data on client side is optimal, because there will be a lot of it.
        - But information becomes lost if user logs in on different computer/clears cache.
        - Maybe store in cloud db until such a time as it becomes an actual problem.
        - Also consider ways to optimize data storage. Consider storing visited ranges. 
            - Many rooms are clustered into areas and will have closely-numbered indicies. Saying you've visited 1-100 is a lot better than 1, 2, 3, 4, ...100. Dynamically rechunk ranges as rooms are visited. 
            - Consider bitvectors as well. Probably won't make the cut due to JSON serialization issues, but still worth a look.
        - Map system assumes all rooms are laid out on a consistent cartisian 3D grid, with room 0 starting at (0,0,0), conceptually.
            - all cartesian coordinates are calculated based on walking recursively through the map and taking note of the steps required to reach each room.
            - Two separate rooms with identical coordinates will cause an assertion failure.
            - Calculate cartesian coordinates on game load. 
            - Cartesian coordinates will be important for client to map rooms out efficiently, so that it won't have to perform a ridiculously large A* walk to find rooms you're next to, but take 200 transitions to actually get to because of maze-like exits. 
            - Graphical editor in later milestone will eventually help maintain this assertion at design time. 
- Show users in room on separate UI panel.
- UI Form Components for accepting user input on panels (Settings, etc).
- Settings system
    - Room display options (verbose v. brief)
    - Display name
    - Timestamp format
    - Concise input mode
    - Store on server so settings travel with users to new computers/browsers

# Milestone 0.3 - Actor update

- Items / Inventory
    - Physical items (each exists as its own entity; swords, armor)
    - Quantifiable items (each exists as a quantity on room/player; cash/keys)
    - Pick up
    - Drop
    - Give/Accept UI
    - Wear/Remove
    - Settings for auto-accept/auto-reject (by default, pop up UI)
    - Items in room UI panel
    - Items on person UI panel
- Actor stats
    - A few predefined stats.
        - Health
        - Energy/Skill points/Mana
        - Experience points
        - More to come.
    - New Stat categories can also be added by extension scripts dynamically
    - Store base value.
    - Store temporary effective value, calculated from:
        - all worn items.
        - all active effects.
    - Recalculate effective value every time effect added/removed or item added/removed.
- Effects system
    - Effects attach to players/rooms/items
    - Effects affect stats
        - Direct value
        - Multiplicative value
        - Effective value = (base + Σ(all effects that have direct value)) * Σ(all effects that have multiplicative value).
- Stat Display component (HP/SP/EXP)
- Gender support
    - Male, Female, Neuter.
- Emotes


# Milestone 0.4 - Infrastructure update

- Figure out the fuckiness with the login system.
    - Signup should log you in. But it randomly doesn't. 
    - Logging in with invalid credentials only shows an error half the time.
    - WTF?
- Player Roles
    - Owner > Admin > Op > Player.
        - For most intents and purposes, Admin = Owner. Except Admin cannot demote Owner. 
    - Ability to limit commands to player role.
    - Command to alter player role [admin].
        - A person of role **X** may only alter the roles of people currently lower than **X**
        - A person of role **X** may never raise them *to* **X**, except Owner. 
- Data persistence
    - Determine strategy. 
        - Update entire database at specific intervals? Might result in "shuddering".
        - Update parts of database at smaller intervals? Might result in data inconsistency.
        - Track entities which have been altered and only update those? Possibly the best solution, though more technically complex.
    - Create a serializer that strips out extra properties contained on DB items which shouldn't go into the schema.
        - Room.actors Set, for example.
- Additional Admin commands
    - Shut down server.
    - Disconnect user.
    - Suspend user. 
- Enhance server-side command parser.
    - Think about making it more declarative.
- Game timer
    - Milliseconds since the game began running.
    - Only ever incremented while game is running.
        - Unfortunately will be out of sync with real-world time
        - But we don't want timers to have expired while the server is down. Could result in unstable game state and unpredictable behavior.
    - Movement timer (or can this be tied into rate limiting inputs?)

# Milestone 0.5 - Extensibility update

- Extensibility Engine
    - Hooks on items/rooms/actors
    - Dynamic reloading of server scripts via admin command. 
    - Ability to add new commands
    - Ability to add new output components
        - Use require.js to load React scripts dynamically
            - Might need to reorder output components on each render. If a new dynamic component is asynchronously loaded but takes longer to download than the next output event, things will be out of order in output.
            - On the other hand, inserting a new output event further up the output window some ~200ms after something else happens will probably look jarring. Experimentation needed.
            - Consider insertion-sort, since list of output components will be almost entirely sorted already.
    - Ability to add new emotes.

# Milestone 0.6 - Quality-of-life improvements

- Introduce an inline color code syntax for colorizing output.
    - regex searchable
    - small, thinking #FFF
    - make methods to make it removable from strings for certain contexts
    - Implement usage rates so that they are not abused. 
    - Or perhaps a maximum amount of delta for a single message. Because a slower gradient is less jarring on the eyes than a lot of rapic chromatic changes. 
    - ... getting carried away here.
- URL detection and hyperlink insertion in chat messages.
- Retain last X global chats (configurable) to allow a user to review the last few bits of conversation.

## Milestone 0.7 - Rooms Update 2

- Enhance rooms design
    - Add first-class support for doors, gates.
        - Always a question on where to store the state of the door/gate, since a door is really two exits, each pointing at the other's destination. 
        - Handle algorithmically. 
            - Cannot store state in two places, bad design, leads to race conditions and corruption.
            - State is stored on exit within the room with the lower index.
            - Door/Gate flag is specified on the exit within the room with the lower index.
            - When map is loaded, a "fixer" algorithm will be applied to remove state and flag from higher-indexed exit, in case database is accidentally corrupted by programmer error. 
            - Assert exits will match two rooms only. 
                - Enforced by graphical editor later on. 
    - Keys (quantifiable item)
        - onUse extensibility point (to allow keys to break upon use)


## Milestone 0.8 - Crafting update

- Crafting

## Milestone 0.9-?

- Monsters
- Character Progression
- Combat
- PVP rules.
- Skills
- Quests
- Clans/Organizations
    - Clan communication commands
- Land rental
    - Clan
    - Individual
- Familiar/Squire/Pet/Buddy system
    - Allows for idle progression
- Karma/Law system
- Magic
- Banks
- Shops
- Map Editor
- Story
- Turkish Drunk Mode
- Console Themes
- Auction Halls/User-run Shops

## Floating (ie: Do them when they become an issue)

- Security/Nuissance issues
    - Rate limiting input
    - Limiting number of connections
    - Limiting number of connections from an IP
    - Rate limiting incomming connections to deal with DDOS
    - Individual permissions banning (ie: banned from global talk)
    - Minimum password length requirement (config setting)
    - Hook up to SendGrid (or equivalent) to send registration emails, to prevent abuse. Or maybe just use a CAPTCHA? 
- Fix styles on login/signup/etc pages

## Undecided on whether it's needed

- Idle disconnect timer
- Light/Dark/Day/Night system?
- Hunger system?
- Sleep/Rest system?
- Stealth?
- Keypad navigation
    - Good idea in theory, bad execution options. Keyup is fired after change on some browsers so we wouldn't be able to cancel the entry of the number into the textbox. Gets messier from there.
- in-game Mail?


## Not in scope

- Localization support
- Multi-tenancy
