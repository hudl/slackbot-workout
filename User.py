import os
import requests
import json
import datetime
import Http

# Environment variables must be set with your tokens
USER_TOKEN_STRING =  os.environ['SLACK_USER_TOKEN_STRING']

class User:

    def __init__(self, user_id, all_employees):
        # The Slack ID of the user
        self.id = user_id

        # The username (@username) and real name
        self.username, self.real_name = self.fetchNames()

        #The location from Bamboo's HR information
        self.location = self.fetchLocation(all_employees)
        
        # A list of all exercises done by user
        self.exercise_history = []

        # A record of all exercise totals (quantity)
        self.exercises = {}

        # A record of exercise counts (# of times)
        self.exercise_counts = {}

        # A record of past runs
        self.past_workouts = {}

        self.has_challenged_today = False

        print "New user: " + self.real_name + " (" + self.username + ")"


    def storeSession(self, run_name):
        try:
            self.past_workouts[run_name] = self.exercises
        except:
            self.past_workouts = {}

        self.past_workouts[run_name] = self.exercises
        self.exercises = {}
        self.exercise_counts = {}


    def fetchNames(self):
        params = {"token": USER_TOKEN_STRING, "user": self.id}
        response = requests.get("https://slack.com/api/users.info", params=params)

        parsed_message, isMessageOkay = Http.parseSlackJSON(response)
        if isMessageOkay:
            user_obj = parsed_message["user"]

            username = user_obj["name"]
            real_name = user_obj["profile"]["real_name"]

            return username, real_name



    def getUserHandle(self):
        return ("@" + self.username).encode('utf-8')

    #parse through all of the employee list to find a matching name
    def fetchLocation(self, all_employees):
        location = ""
        for employee in all_employees:
            if employee["displayName"] == self.real_name or ((employee["nickname"] is not None and employee["nickname"] + " " + employee["lastName"]) == self.real_name):
                location = employee["location"]
                break
        return location
    '''
    Returns true if a user is currently "active", else false
    '''
    def isActive(self):
        params = {"token": USER_TOKEN_STRING, "user": self.id}
        response = requests.get("https://slack.com/api/users.getPresence",params=params)
        parsed_message, isMessageOkay = Http.parseSlackJSON(response)
        if isMessageOkay:
            status = parsed_message["presence"]
            return status == "active"
        else:
            return False

    def addExercise(self, exercise, reps):
        # Add to total counts
        self.exercises[exercise["id"]] = self.exercises.get(exercise["id"], 0) + reps
        self.exercise_counts[exercise["id"]] = self.exercise_counts.get(exercise["id"], 0) + 1

        # Add to exercise history record
        self.exercise_history.append([str(datetime.datetime.now()),exercise["id"],exercise["name"],reps,exercise["units"]])

    def hasDoneExercise(self, exercise):
        return exercise["id"] in self.exercise_counts