# Todo List

## Short Term

- ~~Text output on client (use CSS Grid)~~
- ~~Auto scroll of output box.~~ 
    - ~~hold position when scrolled up~~
    - ~~Select text when mouse click/move.~~
    - ~~Autofocus input box when clicking window with no selection action.~~
- Server-side Command parser
- world communication
- rooms
- room communication
- room movement
- items/inventory
- Stat Display Widget
- Think about extensibility engine at this point. 
- I don't like the message type system. Fix it. 
- Minimum password length requirement (config setting)
- Move to all-in-memory storage. Might require tearing out the session and auth providers stuff.
- Rate limiting input
- Individual permissions banning (ie: banned from global talk)
- Introduce an inline color code syntax for colorizing output.
    - regex searchable
    - small, thinking #FFF
    - make methods to make it removable from strings for certain contexts
    - Implement usage rates so that they are not abused. 
    - Or perhaps a maximum amount of delta for a single message. Because a slower gradient is less jarring on the eyes than a lot of rapic chromatic changes. 
    - ... getting carried away here.


## Long Term

- Fix styles on login/signup/etc pages
- Monsters
- Combat
- Skills
- Magic
- Story
- Turkish Drunk Mode
- Hook up to SendGrid (or equivalent) to send registration emails, to prevent abuse. Or maybe just use a CAPTCHA? 
- Console Themes

## Nice-to-Have, but not on radar

- Localization support