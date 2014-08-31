function Expense(db){
    this.createExpense = function(expenseDetails, userId){
        return db.query({
            queryString: "INSERT INTO expense (name, description, amount, created_by)\
                          VALUES($1, $2, $3, $4)\
                          RETURNING expense_id, name, description, amount, created_by, date_created;",
            argumentArray: [expenseDetails.name, expenseDetails.description, expenseDetails.amount, userId]
        }).then(function(results){
            return results.rows[0];
        });
    };

    this.getExpensesForEvent = function(eventId){
        return db.query({
            queryString: "SELECT *\
                          FROM event_to_expense\
                                INNER JOIN expense\
                                ON expense.expense_id = event_to_expense.expense_id\
                          WHERE event_to_expense.event_id = $1;",
            argumentArray: [eventId]
        }).then(function(results){
            return results.rows;
        });
    };
    this.deleteExpense = function(expenseId, eventId){
        return db.query({
            queryString: "DELETE FROM expense\
                          WHERE expense_id = $1;",
            argumentArray: [expenseId]
        });
    };
}

module.exports = function(db){
    return new Expense(db);
};