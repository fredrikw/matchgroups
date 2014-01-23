# Matched group randomization

This is a very small and simple utility to help doing matched group randomizations. At it's present iteration, it requires tab-separated data having the columns "Individ", "Score", "Vikt" (The last being swedish for weight). The data can then be plotted and similar individuals can be grouped together in "Matched groups". These groups need contain individuals that make up a multiple of the number of treatment groups. When the grouping is done, the data can be randomized to decide which individuals should go to which treatment group.

## Dependencies ##

matchgroups is self contained and can be run locally by opening the index.html file in a browser. It uses [Flot][flot] (included as a submodule) and the [jQuery Parse Plugin][jqparse] (v1.0.1 is included) to do the difficult stuff...

## Installation ##

Since [Flot][flot] is included as a submodule, the following workflow should be used to install.
```Shell
git clone https://github.com/fredrikw/matchgroups.git
cd matchgroups
git submodule init
git submodule update
```

## Known limitations ##
After the "Randomize Groups" button is pressed, the data needs to be reparsed in order to try a different selection of individuals.

[flot]: http://www.flotcharts.org/
[jqparse]: https://github.com/mholt/jquery.parse
