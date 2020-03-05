/*
Unimap - 61-key keyboard layout(8x8)
,-----------------------------------------------------------.
|  `|  1|  2|  3|  4|  5|  6|  7|  8|  9|  0|  -|  =|  Bspc |
|-----------------------------------------------------------|
|Tab  |  Q|  W|  E|  R|  T|  Y|  U|  I|  O|  P|  [|  ]|  \  |
|-----------------------------------------------------------|
|CapsL |  A|  S|  D|  F|  G|  H|  J|  K|  L|  ;|  '|  Enter |
|-----------------------------------------------------------|
|  Shft  |  Z|  X|  C|  V|  B|  N|  M|  ,|  ,|  /|   Shift  |
|-----------------------------------------------------------|
| Ctl | Gui |Alt|        Space      | Alt | Gui | App | Ctl |
`-----------------------------------------------------------'
App:         Windows Menu key
Gui:         Windows key, Mac ⌘ key or Meta key

Key:    8x8 = 64 keys
Layer:  2(bytes/action) * 64 = 128 bytes
        8 layers can be defined in 1KB area.(128 * 8 = 1024)
*/


/**********************************************************************
 * Keymaps
 **********************************************************************/
// keymaps[8-layers][8-rows][8-cols]
KEYMAP_LAYERS = 8;
KEYMAP_ROW = 8;
KEYMAP_COL = 8;

no_map = function() { return [
    [ 0,0,0,0,0,0,0,0 ],
    [ 0,0,0,0,0,0,0,0 ],
    [ 0,0,0,0,0,0,0,0 ],
    [ 0,0,0,0,0,0,0,0 ],
    [ 0,0,0,0,0,0,0,0 ],
    [ 0,0,0,0,0,0,0,0 ],
    [ 0,0,0,0,0,0,0,0 ],
    [ 0,0,0,0,0,0,0,0 ],
]; };

transparent_map = function() { return [
    [ 1,1,1,1,1,1,1,1 ],
    [ 1,1,1,1,1,1,1,1 ],
    [ 1,1,1,1,1,1,1,1 ],
    [ 1,1,1,1,1,1,1,1 ],
    [ 1,1,1,1,1,1,1,1 ],
    [ 1,1,1,1,1,1,1,1 ],
    [ 1,1,1,1,1,1,1,1 ],
    [ 1,1,1,1,1,1,1,1 ],
]; };

// default keymap
keymaps = [
    [
        [   0x29,  0x1e,  0x1f,  0x20,  0x21,  0x22,  0x23,  0x24 ],
        [   0x25,  0x26,  0x27,  0x2d,  0x2e,  0x2a,  0x31,  0x30 ],
        [   0x2f,  0x13,  0x12,   0xc,  0x18,  0x1c,  0x17,  0x15 ],
        [    0x8,  0x1a,  0x14,  0x2b,  0x39,   0x4,  0x16,   0x7 ],
        [    0x9,   0xa,   0xb,   0xd,   0xe,   0xf,  0x33,  0x34 ],
        [   0x28,  0xe5,  0x38,  0x37,  0x36,  0x10,  0x11,   0x5 ],
        [   0x19,   0x6,  0x1b,  0x1d,  0xe1,  0xe0,  0xe3,  0xe2 ],
        [   0x2c,  0xe6,  0xe7,0xa1f1,  0xe4,   0x0,   0x0,   0x0 ],
    ],
    transparent_map(),
    transparent_map(),
    transparent_map(),
    transparent_map(),
    transparent_map(),
    transparent_map(),
    transparent_map(),
];


/**********************************************************************
 * Source output
 **********************************************************************/
function source_output(keymaps) {
    var output = '';
    output += "#include \"action.h\"\n";
    output += "#include \"action_code.h\"\n";
    output += "#include \"actionmap.h\"\n";
    output += "\n";
    output += "const action_t actionmaps[][";
    output += keymaps[0].length;         // row
    output += "][";
    output += keymaps[0][0].length;      // col
    output += "] __attribute__ ((section (\".keymap.keymaps\"))) = {\n";
    for (var i in keymaps) {
        output += "    {\n";
        for (var j in keymaps[i]) {
            output += "        { ";
            for (var k in keymaps[i][j]) {
                output += ('    0x' + keymaps[i][j][k].toString(16)).substr(-6);
                output += ',';
            }
            output += " },\n";
        }
        output += "    },\n";
    }
    output += "};\n";
    return output;
};


/**********************************************************************
 * Hex output
 **********************************************************************/
/*  Flash Map of ATMega32U2/U4(32KB)
 *  +------------+ 0x0000
 *  | .vectors   | 0xac (43vectors * 4bytes)
 *  | .progmem   | PROGMEM variables and PSTR
 *  | .init0-9   |
 *  | .text      | code
 *  | .fini9-0   |
 *  |            | > text region
 *  |------------| _etext
 *  | .data      |
 *  | .bss       |
 *  | .noinit    |
 *  |            | > data region
 *  |------------| 0x6800
 *  | .keymap    | > keymap region(2KB)
 *  |------------| 0x7000
 *  | bootloader | 4KB
 *  +------------+ 0x7FFF
 *
 *  keymap region(.keymap):
 *  +----------------+
 *  |                |
 *  |                |
 *  | keymaps[][][]  | < 2KB-64
 *  |                |
 *  |                |
 *  +----------------+
 */
// Keymap section address and size
KEYMAP_START_ADDRESS = 0x6800;
KEYMAP_SIZE = 0x800;

function hex_line(address, record_type, data) {
    var hexstr2 = function(b) {
        return ('0'+ b.toString(16)).substr(-2).toUpperCase();
    };

    var sum = 0;
    sum += data.length;
    sum += (address >> 8);
    sum += (address & 0xff);
    sum += record_type;

    var line = '';
    line += ':';
    line += hexstr2(data.length);
    line += hexstr2(address >> 8);
    line += hexstr2(address & 0xff);
    line += hexstr2(record_type);
    for (var i = 0; i < data.length; i++) {
        sum = (sum + data[i]);
        line += hexstr2(data[i]);
    }
    line += hexstr2((~sum + 1)&0xff);  // Checksum
    return line;
};

function hex_eof() {
    return ":00000001FF";
};

function hex_output(address, data) {
    var output = [];
    var data_line = [];

    // flatten data into one dimension array
    [].concat.apply([], [].concat.apply([], data)).forEach(function(e) {
        data_line.push(e);
        if (data_line.length == 16) {
            output.push(hex_line(address, 0x00, data_line));
            address += 16;
            data_line.length = 0;   // clear array
        }
    });
    if (data_line.length > 0) {
        output += hex_line(address, 0x00, data_line);
    }
    return output;
}

function hex_keymaps(address) {
    // flatten keymaps and convert a 16bit into two 8bits
    var keymap_data = [];
    keymap_data = [].concat.apply([], [].concat.apply([], keymaps));
    keymap_data = keymap_data.map(function(e) { return [e&0xff, (e&0xff00)>>8]; });
    keymap_data = [].concat.apply([], keymap_data);
    return hex_output(address, keymap_data);
}

function hex_split_firmware(hexstr, keymap_addr, keymap_size) {
    // split ihex content into three parts; lines above/below of keymap and keymap itself
    var line_before = [];
    var line_after = [];
    var keymap_raw = [];
    var out = line_before;
    var addr_offset = 0;
    var lines = hexstr.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.substring(0,1) != ":") break;
        var size = parseInt(line.substring(1,3), 16);
        var addr = parseInt(line.substring(3,7), 16);
        var type = line.substring(7,9);
        if (type == "00") {
            // data
            if (addr + addr_offset < keymap_addr) {
                line_before.push(line);
                out = line_before;
            } else if (addr + addr_offset >= keymap_addr + keymap_size) {
                line_after.push(line);
                out = line_after;
            } else {
                // keymap 16bit codes
                var v = 0;
                for (var j = 0; j < size; j++) {
                    if (j % 2 == 1) {
                        keymap_raw.push(parseInt(line.substring(9+(j*2), 11+(j*2)), 16)<<8 | v);
                    } else {
                        v = parseInt(line.substring(9+(j*2), 11+(j*2)), 16);
                    }
                }
            }
        } else if (type == "04") {
            // extended linear address
            addr_offset = parseInt(line.substring(9, 13), 16)*0x10000;
            if (addr_offset >= keymap_addr + keymap_size) {
                out = line_after;
            }
            out.push(line);
        } else if (type == "01")  {
            // end of file
            line_after.push(line);
        } else {
            out.push(line);
        }
    }

    // form keymap array: 8x16
    var keymap_ret = [];
    var layer = []
    for (;keymap_raw.length > 0;) {
        layer.push(keymap_raw.splice(0,16));
        if (layer.length == 8) {
            keymap_ret.push(layer);
            layer = [];
        }
    }
    return { before: line_before, after: line_after, keymaps: keymap_ret };
}



/**********************************************************************
 * URL encode/decode
 **********************************************************************/
function url_encode_keymap(obj) {
    if (typeof LZString != "undefined" && typeof Base64 != "undefined") {
        return Base64.encode(LZString.compress(JSON.stringify(obj)));
    }
    return window.btoa(JSON.stringify(obj));
};

function url_decode_keymap(str) {
    try {
        // lz-string-1.3.3.js: LZString.decompress() runs away if given short string.
        if (str == null || typeof str != "string" || str.length < 30) return null;

        if (typeof LZString != "undefined" && typeof Base64 != "undefined") {
            return JSON.parse(LZString.decompress(Base64.decode(str)));
        }
        return JSON.parse(window.atob(str));
    } catch (err) {
        return null;
    }
};
