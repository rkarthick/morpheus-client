// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

// jqueryui defaults
$.extend($.ui.dialog.prototype.options, {
    create: function () {
        var $this = $(this);

        // focus first button and bind enter to it
        // $this.parent().find('.ui-dialog-buttonpane button:first').focus();
        $this.keyup(function (e) {
            if (e.keyCode == 13) {
                $this.parent().find('.ui-dialog-buttonpane button:first').click();
                return false;
            }
        });
    }
});


$(document).unbind('keydown').bind('keydown', function (event) {
    var doPrevent = false;
    if (event.keyCode === 8) {
        var d = event.srcElement || event.target;
        if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD'))
             || d.tagName.toUpperCase() === 'TEXTAREA' || d.tagName.toUpperCase() === 'CANVAS') {
            doPrevent = d.readOnly || d.disabled;
        }
        else {
            doPrevent = true;
        }
    }

    if (doPrevent) {
        event.preventDefault();
    }
});

// from lesscss.org
var postRenderScripts = function () {
    var menu = document.getElementById("menu");
    var init = menu.offsetTop;
    var docked;

    var scrollTop = function () {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }
    window.onscroll = function () {
        if (!docked && (menu.offsetTop - scrollTop() < 0)) {
            menu.style.top = 0;
            menu.style.position = 'fixed';
            menu.className = 'docked';
            docked = true;
        } else if (docked && scrollTop() <= init) {
            menu.style.position = 'absolute';
            menu.style.top = init + 'px';
            menu.className = menu.className.replace('docked', '');
            docked = false;
        }
    };
};

