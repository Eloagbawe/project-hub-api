/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  })
  .createTable('projects', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('manager_id').notNullable();
    table.string('title').notNullable();
    table.string('description', 1000).defaultTo('');
    table.foreign('manager_id').references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  })
  .createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('title').notNullable();
    table.string('description', 1000).defaultTo('');
    table.uuid('user_id').notNullable();
    table.uuid('project_id').notNullable();
    table.string('status').notNullable();
    table.foreign('user_id').references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE');
    table.foreign('project_id').references('id').inTable('projects').onUpdate('CASCADE').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  })
  .createTable('user_projects', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('role').notNullable();
    table.uuid('project_id').notNullable();
    table.uuid('user_id').notNullable();
    table.foreign('user_id').references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE');
    table.foreign('project_id').references('id').inTable('projects').onUpdate('CASCADE').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema
        .dropTable('user_projects')
        .dropTable('tasks')
        .dropTable('projects')
        .dropTable('users');
};
