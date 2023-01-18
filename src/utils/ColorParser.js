/*
 * 	JS Trackmania Color Parser
 *
 * Author:		Jon-Mailes "Jonniboy" Gr. (mail �t jonni dot it)
 * 				-> originally written by fuckfish (fish �t stabb dot de)
 * License:		GNU General Public License v2.0 (GPL-2.0) (see LICENSE file)
 *
 * Github:		https://github.com/j0nnib0y/trackmania-colorparser
 * Homepage:	n/a
 */
const constants = {
  HTML_DOLLAR: "&#36;",
  HTML_WHITESPACE: "&nbsp;",
  HTML_STYLE_ITALIC: "font-style:italic;",
  HTML_STYLE_BOLD: "font-weight:bold;",
  HTML_STYLE_NARROW: "letter-spacing:-0.1em;font-size:smaller",
  MANIA_LINK_PREFIX_TMF: "tmtp:///:",
  MANIA_LINK_PREFIX_MP: "maniaplanet:///:",
  SHADOWING_STYLE: "text-shadow: 1px 1px 1px #000; letter-spacing: 1px;",
  SHADOWING_CLASS: false,
};

class ColorParserClass {
  /*  ToDo
   * - toHTML generates highly redundant HTML code because of the formattings like narrow, italic, ... BAD PRACTICE BOY
   * - implement color contrast correction??
   * - doing all these things by DOM, probably? maybe we can improve the code style then, and reduce the redundancy via third party libraries?
   */

  constructor() {
    this.game = "TMF";
    this.shadowing = false;
  }

  // object which contains all public variables (which are meant to be exposed to the outside later)

  validateURL(textval) {
    const urlRegex =
      /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlRegex.test(textval);
  }

  fixURL(url) {
    // if it's already okay, why we should fix it?
    if (!this.validateURL(url)) {
      // if not, ehm, try another thing
      if (this.validateURL("http://" + url)) {
        return "http://" + url;
      }
    }

    // ok, we finally give up - that will be too hard for us atm (we could break something otherwise, too)
    return url;
  }

  parseLinks(string) {
    string = this.parseManiaLinks(string);
    string = string.replace("$L", "$l");
    let chunks = string.split("$l");

    let end = false;

    for (let i = 1; i < chunks.length; i++) {
      /* solution for $l[http://google.de]Google or $l[http://google]Google$l */
      const re = /^\[(.*)](.*)/;
      const captured = re.exec(chunks[i]);

      if (captured) {
        // link construction, overwriting the thing
        chunks[i] = `<a href="${this.fixURL(captured[1])}">${captured[2]}</a>`;
        // this link should end at some point
        end = true;
        // this link should be done, hmm?
        continue;
      }

      /* solution for $lwww.google.de or $lwww.google.de$l */

      if (!end) {
        chunks[i] = `<a href="${this.fixURL(chunks[i])}">${chunks[i]
          .replace("http://", "")
          .replace("https://", "")}</a>`;
        end = true;
      } else {
        end = false;
      }
    }

    return chunks.join("");
  }

  parseManiaLinks(string, game) {
    let chunks = string.replace("$H", "$h").split("$h");
    let end = false;

    function createLink(url, label) {
      return `<a href="${url}">${label}</a>`;
    }

    for (let i = 1; i < chunks.length; i++) {
      /* solution for $h[bla]Bli or $h[bla]Bli$h */

      const re = /^\[(.*)](.*)/;
      const captured = re.exec(chunks[i]);

      if (captured) {
        // link construction, overwriting the thing
        switch (game) {
          case "TMF":
            chunks[i] = createLink(constants.MANIA_LINK_PREFIX_TMF + captured[1], captured[2]);
            break;
          case "MP":
            chunks[i] = createLink(constants.MANIA_LINK_PREFIX_MP + captured[1], captured[2]);
            break;
        }

        // this link should end at some point
        end = true;
        // this link should be done, hmm?
        continue;
      }

      /* solution for $hbla or $hha$h */

      if (!end) {
        switch (game) {
          case "TMF":
            chunks[i] = createLink(constants.MANIA_LINK_PREFIX_TMF + chunks[i], chunks[i]);
            break;
          case "MP":
            chunks[i] = createLink(constants.MANIA_LINK_PREFIX_MP + chunks[i], chunks[i]);
            break;
        }

        end = true;
      } else {
        end = false;
      }
    }

    return chunks.join("");
  }

  setGame(game) {
    if (game === "TMF") {
      this.game = "TMF";
      return true;
    } else if (game === "TM2" || game === "MP") {
      this.game = "MP";
      return true;
    } else {
      return false;
    }
  }

  setShadowing(value) {
    this.shadowing = !!value;
  }

  getStyledString(string, match, color, wide, narrow, caps, italic, stripColors) {
    // so we only have the real string
    //IDEA substringing the command AND the string, and then switch-case it?
    string = string.substring(match.length);

    if (caps) {
      string = string.toUpperCase();
    }

    if ((color || wide || narrow || italic) && string.length > 0) {
      let styles = "";

      if (color && !stripColors) {
        //TODO contrastCorrected??
        styles += "color:#" + color + ";";
      }

      if (italic) {
        styles += constants.HTML_STYLE_ITALIC;
      }

      if (wide) {
        styles += constants.HTML_STYLE_BOLD;
      }

      if (narrow) {
        styles += constants.HTML_STYLE_NARROW;
      }

      string = `<span style="${styles}">${string}</span>`;
    }

    return string;
  }

  toHTML(string, stripColors = false, stripLinks = true, stripTags = "", replaceWhitespace = true) {
    let color = false;
    let wide = false;
    let narrow = false;
    let caps = false;
    let italic = false;

    // for $a and $x commands (relicts of old code, please see the code down under)
    const clipboard = {
      color: false,
      wide: false,
      narrow: false,
      caps: false,
      italic: false,
    };

    /*
     *	STRING PREPARATIONS
     */

    /* if the user wants to disable codes, we do it here */

    // if all should be replaced, let's define what's all
    if (stripTags.toLowerCase() === "all") {
      stripTags = "iwonstmgaxz";
    }

    // now we replace the tags to strip them out finally
    for (let i = 0; i < stripTags.length; i++) {
      string = string.replace("$" + stripTags[i], "");
    }

    /* let's replace some other things directly to use them in HTML without any errors */

    // replace double dollars to let users escape this character properly
    string = string.replace("$$", constants.HTML_DOLLAR);

    // if the user wants to, we can replace the white spaces with HTMLish white spaces
    string = string.replace(" ", constants.HTML_WHITESPACE);

    /* call some other functions to work with the string */

    // fire the link parser to get the rest out of the string already
    string = this.parseLinks(string, !stripLinks);

    /* building chunks as a last preparation step */

    // split the string into an array of substrings with the limiter $
    let chunks = string.split("$");

    /*
     *	MAIN CALCULATIONS
     */

    // now we start the real conversion with a for loop iterating through all items
    // --> starting with 1 because the first item won't have an $ and is therefore no command
    for (let i = 1; i < chunks.length; i++) {
      // resetting some variables
      let maniaLinks = [];

      // color codes
      let matches = chunks[i].match(/^[0-9a-f]{2,3}/i);
      if (matches) {
        color = matches[0];

        if (color.length < 3) {
          color += 8;
        }

        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);

        // continue with the next chunk, because we obviously are done here
        continue;
      }

      // $i code (italic)
      matches = chunks[i].match(/^(i)/i);
      if (matches) {
        italic = true;

        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);
        continue;
      }

      // $w code (wide but not narrow)
      matches = chunks[i].match(/^(w)/i);
      if (matches) {
        narrow = false;
        wide = true;

        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);
        continue;
      }

      // $o code (wide but not narrow???)
      matches = chunks[i].match(/^(o)/i);
      if (matches) {
        narrow = false;
        wide = true;

        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);
        continue;
      }

      // $n code (narrow but not wide)
      matches = chunks[i].match(/^(n)/i);
      if (matches) {
        narrow = true;
        wide = false;

        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);
        continue;
      }

      // $s code (shadow, not implemented)
      matches = chunks[i].match(/^(s)/i);
      if (matches) {
        //TODO shadow???
        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);
        continue;
      }

      // $t code (text to upper case, literally CAPS)
      matches = chunks[i].match(/^(t)/i);
      if (matches) {
        caps = true;

        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);
        continue;
      }

      // $m code (reset text format)
      matches = chunks[i].match(/^(m)/i);
      if (matches) {
        wide = false;
        let bold = false;
        //TODO investigation if this affects other things too

        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);
        continue;
      }

      // $g code (reset text color)
      matches = chunks[i].match(/^(g)/i);
      if (matches) {
        color = false;
        //TODO investigation if this affects other things too

        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);
        continue;
      }

      // $a code (not a real color code in TM, just as a relict from the original code; this is basically for saving styles to some kind of clipboard and resetting all formatting things)
      matches = chunks[i].match(/^(g)/i);
      if (matches) {
        clipboard.color = color;
        clipboard.wide = wide;
        clipboard.narrow = narrow;
        clipboard.caps = caps;
        clipboard.italic = italic;

        color = false;
        wide = false;
        narrow = false;
        caps = false;
        italic = false;

        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);
        continue;
      }

      // $x code (not a real color code in TM, just as a relict from the original code; this is basically for restoring styles from some kind of clipboard)
      matches = chunks[i].match(/^(x)/i);
      if (matches) {
        color = clipboard.color;
        wide = clipboard.wide;
        narrow = clipboard.narrow;
        caps = clipboard.caps;
        italic = clipboard.italic;

        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);
        continue;
      }

      // $z code (reset all formatting)
      matches = chunks[i].match(/^(z)/i);
      if (matches) {
        color = false;
        wide = false;
        narrow = false;
        caps = false;
        italic = false;

        chunks[i] = this.getStyledString(chunks[i], matches[0], color, wide, narrow, caps, italic, stripColors);
      }
    }

    /* join it together again, do some extra things and return it, finally! */

    string = chunks.join("");

    if (this.shadowing) {
      let prefix = "<span";
      let suffix = "</span>";

      if (constants.SHADOWING_STYLE) {
        prefix += ' style="' + constants.SHADOWING_STYLE + '"';
      }

      if (constants.SHADOWING_CLASS) {
        prefix += ' class="' + constants.SHADOWING_CLASS + '"';
      }

      string = prefix + ">" + string + suffix;
    }

    return string;
  }
}
const ColorParser = new ColorParserClass();

module.exports = ColorParser;
