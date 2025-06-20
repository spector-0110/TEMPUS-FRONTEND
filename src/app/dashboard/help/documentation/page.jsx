
const Documentation = () => {    

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Documentation</h2>
            </div>
            <div className="prose max-w-none dark:prose-invert">
                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">Tiqora Hospital Management System</h2>
                    <p className="mb-4">
                        Welcome to the comprehensive documentation for the Tiqora Hospital Management System. 
                        This guide provides detailed information about required fields, features, and error handling procedures.
                    </p>
                </section>

                <section id="doctor-management" className="mb-10">
                    <h3 className="text-xl font-bold mb-3">Doctor Management</h3>
                    
                    <h4 className="text-lg font-semibold mt-5 mb-2">Creating a New Doctor</h4>
                    <p className="mb-3">To add a new doctor to your hospital, navigate to the Doctors section and click "Add New Doctor". The following fields are required:</p>
                    
                    <div className="  p-4 rounded-md mb-4">
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Name:</strong> Full name of the doctor (2-100 characters)</li>
                            <li><strong>Email:</strong> Valid email address format</li>
                            <li><strong>Phone:</strong> Valid phone number with at least 10 digits (don't  include + and - or country code)</li>
                            <li><strong>Specialization:</strong> Doctor's medical specialization (2-100 characters)</li>
                            <li><strong>Qualification:</strong> Doctor's medical qualifications (2-100 characters)</li>
                            <li><strong>Experience:</strong> Number of years of experience (whole number, minimum 0)</li>
                            <li><strong>Age:</strong> Doctor's age (whole number, 20-100)</li>
                            <li><strong>Photo URL:</strong> Optional - URL for the doctor's photo</li>
                            <li><strong>Aadhar Number:</strong>  Doctor's identification number</li>
                        </ul>
                    </div>
                    
                    <h4 className="text-lg font-semibold mt-5 mb-2">Updating Doctor Information</h4>
                    <p className="mb-3">To update an existing doctor's information:</p>
                    <ol className="list-decimal pl-6 space-y-2 mb-4">
                        <li>Navigate to the Doctors section</li>
                        <li>Find the doctor card and click the edit (pencil) icon</li>
                        <li>Update the necessary fields</li>
                        <li>Click "Save Changes"</li>
                    </ol>
                    <p className="mb-3">The same field validations apply as when creating a new doctor. Only changed fields will be sent to the server.</p>
                </section>

                <section id="doctor-schedule" className="mb-10">
                    <h3 className="text-xl font-bold mb-3">Doctor Schedule Management</h3>
                    
                    <h4 className="text-lg font-semibold mt-5 mb-2">Updating Doctor Schedule</h4>
                    <p className="mb-3">To manage a doctor's schedule:</p>
                    <ol className="list-decimal pl-6 space-y-2 mb-4">
                        <li>Navigate to the Doctors section</li>
                        <li>Find the doctor card and click "View Schedule"</li>
                        <li>Update schedule for each day of the week</li>
                    </ol>

                    <div className=" p-4 rounded-md mb-4">
                        <p className="font-semibold mb-2">For each day, the following information is required:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Status:</strong> Active or Inactive for that day</li>
                            <li><strong>Average Consultation Time:</strong> Time in minutes per patient (5-60 minutes)</li>
                            <li><strong>Time Ranges:</strong> One or more time slots when the doctor is available</li>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li><strong>Start Time:</strong> Format HH:MM (24-hour)</li>
                                <li><strong>End Time:</strong> Format HH:MM (24-hour, must be after start time)</li>
                                <li>Time ranges must not overlap within the same day</li>
                            </ul>
                        </ul>
                    </div>
                    
                    <div className=" p-4 border-l-4 border-warning my-4">
                        <p className="font-semibold">Important:</p>
                        <p>All 7 days of the week must be included in the schedule, even if the doctor is inactive on certain days.</p>
                    </div>
                </section>

                <section id="subscription" className="mb-10">
                    <h3 className="text-xl font-bold mb-3">Hospital & Subscription Management</h3>
                    
                    <h4 className="text-lg font-semibold mt-5 mb-2">Updating Hospital Details</h4>
                    <p className="mb-3">To update your hospital information:</p>
                    <ol className="list-decimal pl-6 space-y-2 mb-4">
                        <li>Navigate to the Account section</li>
                        <li>Click "Edit Profile"</li>
                        <li>Update the necessary information in the form</li>
                        <li>Submit the changes</li>
                    </ol>
                    
                    <div className=" p-4 rounded-md mb-4">
                        <p className="font-semibold mb-2">The following fields can be updated:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Hospital Information:</strong>
                                <ul className="pl-6 space-y-1">
                                    <li>Name (3-100 alphanumeric characters)</li>
                                    <li>GSTIN (valid format required)</li>
                                    <li>Established Date (cannot be in the future)</li>
                                </ul>
                            </li>
                            <li><strong>Address Information:</strong>
                                <ul className="pl-6 space-y-1">
                                    <li>Street Address (5-200 characters)</li>
                                    <li>City (2-100 characters)</li>
                                    <li>District (2-100 characters)</li>
                                    <li>State (2-100 characters)</li>
                                    <li>PIN Code (6 digits)</li>
                                </ul>
                            </li>
                            <li><strong>Contact Information:</strong>
                                <ul className="pl-6 space-y-1">
                                    <li>Phone Number (at least 10 digits)</li>
                                    <li>Website (valid URL format)</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    
                    <p className="mb-3">After submitting the updates, you will need to verify with an OTP sent to your registered email or phone.</p>
                </section>

                <section id="error-handling" className="mb-10">
                    <h3 className="text-xl font-bold mb-3">Error Handling & Troubleshooting</h3>
                    
                    <h4 className="text-lg font-semibold mt-5 mb-2">Common Errors and Solutions</h4>
                    
                    <div className="space-y-4 mb-4">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                            <div className=" p-3 font-medium">Form Validation Errors</div>
                            <div className="p-4">
                                <p className="mb-2"><strong>Symptoms:</strong> Red error text under fields, form doesn't submit</p>
                                <p className="mb-2"><strong>Solution:</strong> Check the error messages and correct your inputs. Hover over fields for specific requirements.</p>
                            </div>
                        </div>
                        
                        <div className="border border-gray-900 dark:border-gray-700 rounded-md overflow-hidden">
                            <div className=" p-3 font-medium">API Connection Errors</div>
                            <div className="p-4">
                                <p className="mb-2"><strong>Symptoms:</strong> Error messages about connection failures or timeouts</p>
                                <p className="mb-2"><strong>Solution:</strong> Check your internet connection. If the problem persists, try refreshing the page or logging out and back in.</p>
                            </div>
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                            <div className=" p-3 font-medium">Schedule Validation Errors</div>
                            <div className="p-4">
                                <p className="mb-2"><strong>Symptoms:</strong> Error when saving doctor schedules</p>
                                <p className="mb-2"><strong>Solution:</strong> Ensure all 7 days have schedules, even if inactive. Check that time ranges don't overlap and end times are after start times.</p>
                            </div>
                        </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold mt-5 mb-2">Refreshing Data</h4>
                    <p className="mb-3">The application automatically refreshes data after operations such as:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Adding or updating a doctor</li>
                        <li>Updating doctor schedules</li>
                        <li>Updating hospital details</li>
                    </ul>
                    
                    <p className="mb-3">If you encounter stale data or need to manually refresh:</p>
                    <ol className="list-decimal pl-6 space-y-2 mb-4">
                        <li>Check your internet connection</li>
                        <li>Refresh the browser page</li>
                        <li>If problems persist, log out and log back in</li>
                    </ol>
                    
                    <div className=" p-4 border-l-4 border-blue-400 my-4">
                        <p className="font-semibold">Tip:</p>
                        <p>Most operations in the system will display success or error messages to keep you informed about the status of your actions.</p>
                    </div>
                </section>
                
                <section id="best-practices" className="mb-10">
                    <h3 className="text-xl font-bold mb-3">Best Practices</h3>
                    
                    <ul className="list-disc pl-6 space-y-3">
                        <li>Regularly update doctor information to ensure accuracy</li>
                        <li>Set realistic consultation times based on the complexity of cases</li>
                        <li>Maintain complete and accurate schedules for all doctors</li>
                        <li>Use descriptive naming conventions for easy identification</li>
                        <li>Check for validation errors before submitting forms</li>
                        <li>Keep your browser and application updated for optimal performance</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

export default Documentation;