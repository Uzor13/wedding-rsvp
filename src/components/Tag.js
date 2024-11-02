import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {Button} from "./ui/button";
import {Check, Loader2, Plus, Tag, Trash2} from 'lucide-react';
import axios from "axios";
import NavBar from "./ui/NavBar";
import Alert from "./ui/Alert";
import AlertDialogContent from "./ui/AlertDialogContent";
import AlertDialog from "./ui/AlertDialog";
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "./ui/AlertParts";
import AlertDescription from "./ui/AlertDescription";
import {useNavigate} from "react-router-dom";

const TagManagement = () => {
    const [tags, setTags] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [newTagName, setNewTagName] = useState('');
    const [alert, setAlert] = useState({type: '', message: '', visible: false});
    const [untaggedUsers, setUntaggedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState({
        tags: false,
        users: false,
        create: false,
        delete: false,
        assign: false
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Confirmation dialog state
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        tagId: null,
        tagName: ''
    });

    const navigate = useNavigate();


    const api = axios.create({
        baseURL: `${process.env.REACT_APP_SERVER_LINK}/api`
    });

    const token = localStorage.getItem('adminToken');

    // Fetch tags and users on component mount
    useEffect(() => {
        fetchTags().then(r => console.log(r)).catch(e => console.log(e));
        fetchUsers().then(r => console.log(r)).catch(e => console.log(e));
    }, []);

    const showAlert = (type, message) => {
        setAlert({type, message, visible: true});
        setTimeout(() => {
            setAlert({type: type, message: message, visible: true});
        }, 3000);
    };

    // Function to fetch tags
    const fetchTags = async () => {
        setIsLoading(prev => ({...prev, tags: true}));
        try {
            const {data} = await api.get('/tags');
            setTags(data);
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Error fetching tags');
        } finally {
            setIsLoading(prev => ({...prev, tags: false}));
        }
    };

    // Function to fetch users
    const fetchUsers = async () => {
        setIsLoading(prev => ({...prev, users: true}));
        try {
            const {data} = await api.get('/admin/guests', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(data);
            console.log(data);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            }
            showAlert('error', error.response?.data?.message || 'Error fetching users');
        } finally {
            setIsLoading(prev => ({...prev, users: false}));
        }
    };

    // Function to create a new tag
    const handleCreateTag = async () => {
        if (!newTagName.trim()) {
            setAlert({
                type: 'warning',
                message: 'Tag name cannot be empty',
                visible: true
            })
            return;
        }

        setIsLoading(prev => ({...prev, create: true}));

        try {
            await api.post('/tags', {name: newTagName});
            await fetchTags();
            setNewTagName('');
            setAlert({
                type: 'success',
                message: 'Tag created successfully',
                visible: true
            })
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            }
            showAlert('error', error.response?.data?.message || 'Error creating tag');
        } finally {
            setIsLoading(prev => ({...prev, create: false}));
        }
    };

    // Function to assign users to a tag
    const handleAssignUsers = async () => {
        if (!selectedTag || selectedUsers.length === 0) return;

        setIsLoading(prev => ({...prev, assign: true}));
        try {
            await api.post(`/tags/${selectedTag._id}/users`, {
                userIds: selectedUsers
            });
            await fetchTags();
            setSelectedUsers([]);
            showAlert('success', `Users assigned to ${selectedTag.name} successfully`);
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Error assigning users');
        } finally {
            setIsLoading(prev => ({...prev, assign: false}));
        }
    };


    // Function to delete a tag
    const handleDeleteTag = async (tagId) => {
        setIsLoading(prev => ({...prev, delete: true}));
        try {
            await api.delete(`/tags/${tagId}`);
            await fetchTags();
            if (selectedTag?._id === tagId) {
                setSelectedTag(null);
            }
            showAlert('success', 'Tag deleted successfully');
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Error deleting tag');
        } finally {
            setIsLoading(prev => ({...prev, delete: false}));
            setDeleteConfirmation({isOpen: false, tagId: null, tagName: ''});
        }
    };

    const openDeleteConfirmation = (tagId, tagName, e) => {
        e.stopPropagation();
        setDeleteConfirmation({
            isOpen: true,
            tagId,
            tagName
        });
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const getUnassignedUsers = () => {
        if (!selectedTag) return [];
        return users.filter(user =>
            !selectedTag.users?.some(taggedUser => taggedUser._id === user._id)
        ).filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    useEffect(() => {
        filterUntaggedUsers();
    }, [users, tags]);

    const filterUntaggedUsers = () => {
        // Get a set of user IDs that are assigned to any tag
        const taggedUserIds = new Set();
        tags.forEach(tag => {
            tag.users?.forEach(user => taggedUserIds.add(user._id));
        });

        // Filter users to only include those not in the taggedUserIds set and match search
        const untaggedUsersList = users.filter(user =>
            !taggedUserIds.has(user._id) &&
            (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.phoneNumber.includes(searchQuery))
        );

        setUntaggedUsers(untaggedUsersList);
    };

    return (
        <>
            <NavBar/>
            <div className="flex flex-col space-y-4 p-4">
                {/* Alert Component */}
                {alert.visible && (
                    <Alert className={`${
                        alert.type === 'error' ? 'border-red-500 bg-red-50' :
                            alert.type === 'success' ? 'border-green-500 bg-green-50' : ''
                    }`}>
                        <AlertDescription alert={alert} setAlert={setAlert}/>
                    </Alert>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog
                    open={deleteConfirmation.isOpen}
                    onOpenChange={(isOpen) =>
                        setDeleteConfirmation(prev => ({ ...prev, isOpen }))
                    }
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the tag "{deleteConfirmation.tagName}"
                                and remove it from all associated users. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleDeleteTag(deleteConfirmation.tagId)}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                {isLoading.delete ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Delete'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Create New Tag Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Tag className="mr-2"/>
                            Create New Tag
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="Enter tag name"
                                className="flex-1 px-3 py-2 border rounded-md"
                            />
                            <Button onClick={handleCreateTag}>
                                <Plus className="w-4 h-4 mr-2"/>
                                Create Tag
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tag List and User Assignment Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tags List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {(Array.isArray(tags) ? tags : []).map(tag => (
                                    <div
                                        key={tag._id}
                                        className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                                            selectedTag?._id === tag._id ? 'bg-blue-100' : 'hover:bg-gray-100'
                                        }`}
                                        onClick={() => setSelectedTag(tag)}
                                    >
                                        <span>{tag.name}</span>
                                        <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {tag.users?.length || 0} guests
                    </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    openDeleteConfirmation(tag._id, tag.name, e);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500"/>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Assignment Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {selectedTag ? `Assign Guests to ${selectedTag.name}` : 'Select a tag'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search for a guest"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        filterUntaggedUsers();
                                    }}
                                    className="p-2 border border-gray-300 rounded-md w-full"
                                />
                            </div>
                            {selectedTag ? (
                                <>
                                    <div className="space-y-2 mb-4">
                                        {untaggedUsers.map(user => (
                                            <div
                                                key={user._id}
                                                className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                                                    selectedUsers.includes(user._id) ? 'bg-blue-100' : 'hover:bg-gray-100'
                                                }`}
                                                onClick={() => toggleUserSelection(user._id)}
                                            >
                                                <span>{user.name}</span>
                                                {selectedUsers.includes(user._id) && (
                                                    <Check className="w-4 h-4 text-blue-500"/>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {selectedUsers.length > 0 && (
                                        <Button onClick={handleAssignUsers} className="w-full">
                                            Assign {selectedUsers.length} Guests to {selectedTag.name}
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-gray-500">
                                    Select a tag to assign users
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default TagManagement;