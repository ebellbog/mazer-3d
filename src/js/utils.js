function initUtils() {
    Array.prototype.shuffle = function() {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }

    $.fn.extend({
        disable: function () {
            $(this)
                .attr('disabled', true)
                .addClass('disabled')
                .find('input').attr('disabled', true);
        },
        enable: function() {
            $(this)
                .attr('disabled', false)
                .removeClass('disabled')
                .find('input').attr('disabled', false);
        }
    });
}

// min inclusive max inclusive
function randInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) ) + min;
}

export {randInt, initUtils};