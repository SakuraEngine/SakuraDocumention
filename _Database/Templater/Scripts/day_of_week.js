function day_of_week(week_str) {
    // query date
    let date = moment(week_str, 'gggg-[W]ww');
    let week_start = date.startOf('week');

    // collect result
    let result = [];
    for (let i = 0; i < 7; ++i) {
        result.push(week_start.weekday(i).format('YYYY-MM-DD'));
    }

    return result;
}

module.exports = day_of_week;