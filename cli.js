#!/usr/bin/env node

const { Octokit } = require('octokit');
const { question } = require("readline-sync");

const gitAuth = question("GitHub token :");
const octokit = new Octokit({
  auth: gitAuth,
});

const prompts = require('prompts');

const questions = [
    {
      type: 'text',
      name: 'username',
      message: 'What is your GitHub username?'
    },
    {
      type: 'text',
      name: 'repository',
      message: 'Repository name: '
    },
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
    },
    {
        type: 'select',
        name: 'template',
        message: 'Choose a project template!',
        choices:[
        {title:'Basic Kanban', value: 'Basic Kanban'},
        {title:'Automated Kanban', value: 'Automated Kanban'},
        {title:'Bugs Triage', value: 'Bugs Triage'},
        ],
    }
  ];
// prompting for values
async function enterValues(){
    const response = await prompts(questions);
    
    console.log(response.username);
  run(response.username,response.repository,response.projectName,response.template);
}

async function run(username,repository,projectName,template){
  try{
    const { data: project } = await octokit.request('POST /repos/{owner}/{repo}/projects', {
      owner: username,
      repo: repository,
      name: projectName,
      mediaType: {
        previews: [
          'inertia'
        ]
      }
    });

    console.log("Created project "+ project.name);
    console.log("Template : "+template);

    create_project(template,project.id);

  }    
  catch(err){
    console.error(err);
  }
}

async function create_project(template, projectID){
    const cols ={'Automated Kanban':['To Do','In progress','Review in progress','Reviewer approved','Done'],
      'Bugs Triage':['Needs Triage','High Priority','Low Priority','Closed'],
      'Basic Kanban': ['To Do','In progress','Done']}

    console.log('Project ID: '+ projectID)

    for(const col in cols[template]){
        const { data: column } = await octokit.request('POST /projects/{project_id}/columns', {
            project_id: projectID,
            name: cols[template][col],
            mediaType: {
              previews: [
                'inertia'
              ]
            }
          });
        
        console.log('Added column '+column.name);
    }
}


enterValues();


