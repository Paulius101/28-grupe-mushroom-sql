const mysql = require('mysql2/promise');

const app = {}

app.init = async () => {
    // prisijungti prie duomenu bazes
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'mushroom',
    });

    let sql = '';
    let rows = [];

    // LOGIC BELOW

    const upName = (str) => {
        return str[0].toUpperCase() + str.slice(1);
    }

    // 1
    sql = 'SELECT `mushroom`, `price` FROM `mushroom` ORDER BY `price` DESC';
    [rows] = await connection.execute(sql);

    console.log('Grybai:');
    let i = 0;
    for (const { mushroom, price } of rows) {
        console.log(`${++i}) ${upName(mushroom)} - ${price} EUR/kg`);
    }

    console.log('');
    // 2
    sql = 'SELECT `name` FROM `gatherer`';
    [rows] = await connection.execute(sql);

    const names = rows.map(obj => obj.name);
    console.log(`Grybautojai: ${names.join(', ')}.`);

    console.log('');
    // 3
    sql = 'SELECT `mushroom`, `price` \
            FROM `mushroom` \
            WHERE `price` = ( \
                SELECT MAX(`price`) \
                FROM `mushroom` \
            )';
    [rows] = await connection.execute(sql);

    console.log(`Brangiausias grybas yra: ${upName(rows[0].mushroom)}.`);

    console.log('');
    // 4
    sql = 'SELECT `mushroom`, `price` \
            FROM `mushroom` \
            WHERE `price` = ( \
                SELECT MIN(`price`) \
                FROM `mushroom` \
            )';
    [rows] = await connection.execute(sql);

    console.log(`Pigiausias grybas yra: ${upName(rows[0].mushroom)}.`);

    console.log('');
    // 5
    sql = 'SELECT `mushroom`, `weight` FROM `mushroom`';
    [rows] = await connection.execute(sql);

    console.log(`Grybai:`);
    i = 0;
    for (const item of rows) {
        const amount = 1000 / item.weight;
        console.log(`${++i}) ${upName(item.mushroom)} - ${amount.toFixed(1)}`);
    }

    console.log('');
    // 6
    sql = 'SELECT `gatherer`.`name`, SUM(`basket`.`count`) as "count" \
            FROM `gatherer` \
            LEFT JOIN `basket` \
                ON `gatherer`.`id` = `basket`.`gatherer_id`\
            GROUP BY `gatherer`.`name` \
            ORDER BY `gatherer`.`name` ASC';
    [rows] = await connection.execute(sql);

    console.log('Grybu kiekis pas grybautoja:');
    i = 0;
    for (const { name, count } of rows) {
        console.log(`${++i}) ${name} - ${count} grybu`);
    }

    console.log('');
    // 7
    sql = 'SELECT `gatherer`.`name`, \
                SUM(`basket`.`count` * (`mushroom`.`weight` / 1000) * `mushroom`.`price`) as payment \
            FROM`gatherer` \
            LEFT JOIN`basket` \
                ON`gatherer`.`id` = `basket`.`gatherer_id` \
            LEFT JOIN`mushroom` \
                ON`mushroom`.`id` = `basket`.`mushroom_id` \
            GROUP BY`gatherer`.`name` \
            ORDER BY`gatherer`.`name` ASC; ';
    [rows] = await connection.execute(sql);

    console.log('Grybu krepselio kainos pas grybautoja:');
    i = 0;
    for (const { name, payment } of rows) {
        console.log(`${++i}) ${name} - ${(+payment).toFixed(2)} EUR`);
    }
}

app.init();

module.exports = app;