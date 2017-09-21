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
- Output user input in output panel when submitted, to make it clear where the input was received. 
- Timestamps on communication messages.
    - All messages?
    - Yeah. Why not. 
- Ping command
- Rooms
    - Assignment upon entering game
    - Show description when entering game
    - look command to view contents of room
    - communication
    - movement
    - Show description upon entering room
    - Keypad navigation
    - Movement timer (or can this be tied into rate limiting inputs?)
- Better connection messaging
    - Disconnected message
    - Cannot connect message
- Move auth system to in-memory provider. Might need to write a custom provider to do this.
    - Bother.
- Public Server
    - Beanstalk?
    - Automated or One Command deploy.

# Milestone 0.2 - UI update

- Wireframe layout of the UI, figure out where to put components.
    - Input/Output area.
    - Contextual action bar 
        - room indicates react component to use.
        - IE "bank" would send "BankContextComponent", which loads a bar that allows you to quickly withdraw or deposit money. 
    - Minimap.
- Minimap
    - Figure out how to represent up/down links on the map. 
    - Limited A* navigation by clicking on minimap.
    - Hide rooms user has not visited.
        - Wrinkle. Storing visited data on client side is optimal, because there will be a lot of it.
        - But information becomes lost if user logs in on different computer/clears cache.
        - Maybe store in cloud db until such a time as it becomes an actual problem.
        - Also consider ways to optimize data storage. Consider storing visited ranges. 
            - Many rooms are clustered into areas and will have closely-numbered indicies. Saying you've visited 1-100 is a lot better than 1, 2, 3, 4, ...100. Dynamically rechunk ranges as rooms are visited. 
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

# Milestone 0.6 - UI quality-of-life improvements

- Introduce an inline color code syntax for colorizing output.
    - regex searchable
    - small, thinking #FFF
    - make methods to make it removable from strings for certain contexts
    - Implement usage rates so that they are not abused. 
    - Or perhaps a maximum amount of delta for a single message. Because a slower gradient is less jarring on the eyes than a lot of rapic chromatic changes. 
    - ... getting carried away here.
- URL detection and hyperlink insertion in chat messages.

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
- Map Editor
- Story
- Turkish Drunk Mode
- Console Themes

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

## Not in scope

- Localization support
- Multi-tenancy
