import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

resolver.define('getText', (req) => {
    console.log(req);

    return 'Hello world!';
});

resolver.define('getProjects', async (req) => {
    console.log('Fetching projects...');

    try {
        // Now use api.asApp() with route for Jira project search
        const response = await api.asApp().requestJira(route`/rest/api/3/project/search`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
});

export const handler = resolver.getDefinitions();

