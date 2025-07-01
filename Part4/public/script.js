// public/script.js

const API_URL = '/api/blogs';

// Get references to HTML elements
const blogsList = document.getElementById('blogs-list');
const addBlogForm = document.getElementById('add-blog-form');
const loadingMessage = document.getElementById('loading-message');

/**
 * Fetches and displays all blogs from the API.
 */
async function fetchBlogs() {
    loadingMessage.textContent = 'Loading blogs...';
    blogsList.innerHTML = ''; // Clear existing blogs

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blogs = await response.json();

        if (blogs.length === 0) {
            loadingMessage.textContent = 'No blogs found. Add one above!';
        } else {
            loadingMessage.textContent = '';
            blogs.forEach(blog => {
                const blogItem = document.createElement('div');
                blogItem.className = 'blog-item p-4 bg-gray-50 rounded-md shadow-sm flex justify-between items-center';
                // Ensure blog.id is correctly used for data-id
                blogItem.innerHTML = `
                    <div>
                        <h3 class="text-xl font-bold text-blue-700">${blog.title}</h3>
                        <p class="text-gray-600">by ${blog.author}</p>
                        <p class="text-gray-500 text-sm">Likes: ${blog.likes}</p>
                        <a href="${blog.url}" target="_blank" class="text-blue-500 hover:underline text-sm break-all">${blog.url}</a>
                    </div>
                    <button class="delete-btn px-3 py-1 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400" data-id="${blog.id}">Delete</button>
                `;
                blogsList.appendChild(blogItem);
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', handleDeleteBlog);
            });
        }
    } catch (error) {
        console.error('Error fetching blogs:', error);
        loadingMessage.textContent = 'Failed to load blogs. Please check your server and network.';
        loadingMessage.className = 'text-red-600 text-center';
    }
}

/**
 * Handles adding a new blog from the form.
 */
async function handleAddBlog(event) {
    event.preventDefault();

    const formData = new FormData(addBlogForm);
    const newBlog = {
        title: formData.get('title'),
        author: formData.get('author'),
        url: formData.get('url'),
        likes: parseInt(formData.get('likes'), 10) || 0
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBlog)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
        }

        console.log('Blog added successfully:', await response.json());
        addBlogForm.reset();
        fetchBlogs(); // Refresh list
    } catch (error) {
        console.error('Error adding blog:', error);
        alert('Failed to add blog. Please check the input and try again.\nDetails: ' + error.message);
    }
}

/**
 * Handles deleting a blog post.
 */
async function handleDeleteBlog(event) {
    // Correctly get the blog ID from the button's data-id attribute
    const blogId = event.target.dataset.id;

    // Check if blogId is actually defined before proceeding
    if (!blogId) {
        console.error('Error: Blog ID not found for deletion button.');
        alert('Could not determine which blog to delete. Please try refreshing the page.');
        return;
    }

    if (!confirm('Are you sure you want to delete this blog post?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${blogId}`, {
            method: 'DELETE',
        });

        if (response.status === 204) {
            console.log(`Blog with ID ${blogId} deleted successfully.`);
            fetchBlogs(); // Refresh list
        } else if (response.status === 404) {
            alert('Blog not found. It might have already been deleted.');
            fetchBlogs(); // Refresh in case of sync issue
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
        }
    } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete blog. Please try again.\nDetails: ' + error.message);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', fetchBlogs);
addBlogForm.addEventListener('submit', handleAddBlog);
