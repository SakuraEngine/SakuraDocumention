async function navigate_day(date_str, offset, out_fmt, by_link = true, show_fmt = null, not_exist_str = null) {
    let date = moment(date_str).add(offset, 'days');
    date_str = date.format(out_fmt);

    console.log(app.vault.adapter.getBasePath());
    if (by_link) {
        const file_exist = await app.vault.adapter.exists(`1-Daily/10-Diary/2022/${date_str}.md`, true);
        if (file_exist == false && not_exist_str != null) {
            return not_exist_str;
        } else {
            return show_fmt == null ? `[[${date_str}]]` : `[[${date_str}|${date.format(show_fmt)}]]`;
        }
    }
    else {
        return date_str;
    }
}

module.exports = navigate_day;