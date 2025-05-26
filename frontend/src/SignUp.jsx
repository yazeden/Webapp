import React, { useState } from 'react'

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password1: '',
        password2: '',
        rememberme: false,
    })    

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
    })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (formData.password1 !== formData.password2) {
            alert('Passwords do not match!')
            return
        }

        console.log('Form data:', formData)
    // hier zou je normaal een POST request doen naar de backend API
    }

    return (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-50 p-6">
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white shadow-md rounded-lg p-8"
        >
        <h2 className="text-3xl font-semibold text-green-700 mb-4">Sign-Up</h2>
        <p className="text-sm text-gray-600 mb-6">
            After signing up, you can link your smart greenhouse using a unique
            setup key. Don't have a greenhouse yet? Contact us for installation
            and configuration.
        </p>

        <div className="mb-4">
            <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
        </div>

        <div className="mb-4">
            <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
        </div>

        <div className="mb-4">
            <input
                type="password"
                name="password1"
                placeholder="Enter password"
                value={formData.password1}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
        </div>

        <div className="mb-4">
            <input
                type="password"
                name="password2"
                placeholder="Repeat password"
                value={formData.password2}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
        </div>

        <div className="mb-6 flex items-center">
            <input
                type="checkbox"
                name="rememberme"
                checked={formData.rememberme}
                onChange={handleChange}
                className="mr-2"
            />
            <label htmlFor="rememberme" className="text-sm text-gray-700">
            Remember me
            </label>
        </div>

        <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-300">
            Sign-Up
        </button>
    </form>

    <img
        src="/images/greenhouse.png"
        alt="Greenhouse"
        className="hidden md:block md:ml-10 md:w-96"
    />
    </div>
    )
}

export default SignUp
