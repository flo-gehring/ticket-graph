import React, { useState, useEffect } from 'react';
import { requestJira, invoke } from '@forge/bridge';
import {
    Box,
    Stack,
    Heading,
    Select,
    Spinner,
    ErrorMessage,
    Text,
} from '@forge/react';

const App = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [projectsError, setProjectsError] = useState(null);

    /**
     * Fetch all projects accessible to the current user from Jira
     */
    const fetchProjects = async () => {
        setProjectsLoading(true);
        setProjectsError(null);
        try {
            const data = await invoke('getProjects');
            const projectOptions = data.values ? data.values.map(project => ({
                label: project.name,
                value: project.key
            })) : [];
            console.log('Fetched projects:', projectOptions);
            setProjects(projectOptions);
            if (projectOptions.length > 0) {
                setSelectedProject(projectOptions[0].value);
            }
        } catch (err) {
            setProjectsError(`Failed to fetch projects: ${err.message}`);
            console.error(err);
        } finally {
            setProjectsLoading(false);
        }
    };

    /**
     * Fetch current user information from Jira API
     */
    const fetchUserInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await requestJira(`/rest/api/3/users/search`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            setUserInfo(data[0]);
        } catch (err) {
            setError(`Failed to fetch user info: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch projects and user info on component mount
    useEffect(() => {
        fetchProjects();
        fetchUserInfo();
    }, []);

    return (
        <Stack space="space.400">
            {/* Project Selection Section */}
            <Box padding="space.400">
                <Stack space="space.300">
                    <Heading level="h1">Select a Project</Heading>
                    {projectsError && <ErrorMessage>{projectsError}</ErrorMessage>}
                    {projectsLoading ? (
                        <Spinner />
                    ) : (
                        <Select
                        appearance='default'
                            options={projects}
                            value={selectedProject}
                            onChange={(option) => setSelectedProject(option.value)}
                            placeholder="Choose a project..."
                        />
                    )}
                    {selectedProject && (
                        <Text>Selected project: <strong>{selectedProject}</strong></Text>
                    )}
                </Stack>
            </Box>

            {/* User Information Section */}
            <Box padding="space.400">
                <Stack space="space.300">
                    <Heading level="h2">Current User Information</Heading>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    {loading ? (
                        <Spinner />
                    ) : (
                        userInfo && (
                            <Box padding="space.200" style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                                <Text>Display name: <strong>{userInfo.displayName}</strong></Text>
                            </Box>
                        )
                    )}
                </Stack>
            </Box>
        </Stack>
    );
};

export default App;