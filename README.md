# Sym
Hosted at (sym.gg)[https://sym.gg/].

Your one-place-stop for insight on game mechanics. Successor to https://symthic.com .


## Contributing and suggestions

All suggestions for new features and reports for bugs should start by creating an 
[issue](https://github.com/miffyli/sym/issues), where we can discuss the topic further. 

If you spotted a typo or a small bug on site (max .few lines of changes), feel free to make a
[pull request](https://github.com/miffyli/sym/pulls) out of it.

### Code guidelines

* Javascript should be written according to [JavaScript Standard Style](https://standardjs.com/)
* For HTML5 follow [W3School's HTML5 style guide](https://www.w3schools.com/html/html5_syntax.asp)
* Git commit messages should be done in [imperative commit-style](https://stackoverflow.com/a/3580764/2867076).
* Site should be light on the server, thus things should be done on Javascript. Server just serves
  static files, javascripts and any databases in JSON files.


## Design principles

Each section of page has independent code, i.e. no sharing of code between games. This results to code
duplication and some difficulties in mantaining, but this is done as games can have small or large
differences in their mechanics, even across titles from same series (e.g. Battlefield 1 vs. Battlefield V).
Game-specific pages can refer to elements from main site, but not the other way around. 


## Team

Currently Sym webpages are mainly developed by [Miffyli](https://github.com/miffyli),
[Robenter](https://github.com/robenter) and [IncarnateNA](https://github.com/IncarnateNA).


## Contact

You find all current main developers on [Sym Discord server](https://discord.gg/Z9vcu46).


## Licensing

Code original to the Sym website is licensed under MIT license. 

Content original to games is used under Fair Use. These are mainly small
icons and images (e.g. images of weapons and gadgets) taken from the files
of the corresponding video games (e.g. Battlefield and Apex Legends titles).
