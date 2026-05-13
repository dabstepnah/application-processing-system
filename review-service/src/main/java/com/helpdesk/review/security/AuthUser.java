package com.helpdesk.review.security;
public record AuthUser(Long userId,String username,String role){ public boolean isAdmin(){return "ADMIN".equals(role);} }
